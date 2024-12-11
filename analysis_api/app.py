from flask import Flask, request, send_file, jsonify
import os
import zipfile
from io import BytesIO
import pandas as pd
import matplotlib.pyplot as plt
import time
from PIL import Image
from flask_cors import CORS
import base64
import re
import functools
import numpy as np
from scipy import stats

import eeg
import cocoa_pad

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


def encode_image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
    return encoded_string

def compute_confidence_interval(data, confidence=0.95):
    """
    Compute the confidence interval for the provided data.

    Parameters:
    - data (np.array): Array of data points.
    - confidence (float): Confidence level (default is 0.95).

    Returns:
    - ci_lower (np.array): Lower bound of the confidence interval.
    - ci_upper (np.array): Upper bound of the confidence interval.
    """
    n = data.shape[0]
    m = np.mean(data, axis=0)
    se = stats.sem(data, axis=0)
    h = se * stats.t.ppf((1 + confidence) / 2., n - 1)
    return m - h, m + h

# TODO: handle multiple files
@app.route('/api/v1/process_eeg', methods=['POST'])
def process_eeg():
    try:
        # Check if the POST request contains a file with the key 'file'
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400

        if 'fileTimestamp' not in request.form:
            return jsonify({'error': 'No file timestamp'}), 400

        file = request.files['file']

        fileTimestamp = request.form['fileTimestamp']

        # Check if the file has a filename
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Check if the file is a ZIP file
        if file.filename.endswith('.zip'):
            # Create a temporary directory to store the unzipped files
            temp_dir = 'temp_unzip' # +`` "_" + str(int(time.time()))
            os.makedirs(temp_dir, exist_ok=True)

            # Save the ZIP file to the temporary directory
            zip_file_path = os.path.join(temp_dir, file.filename)
            file.save(zip_file_path)

            # Unzip the file
            with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir + "/raw_files")
            
            print("file directory", temp_dir)

            # TODO: validate that is has all the files we need for processing
            # now call eeg.py methods to return distributions
            # this is assuming it's only one session
            file_bundles = eeg.extractBundledEEG(temp_dir + "/raw_files/")
            analysisEngine = eeg.analysisEngine({
                "session": file_bundles.extractById(int(fileTimestamp))
            }, bundleType="ids", qualityCutoffFilter=1)

            # if - isApi, these methods should return png            
            powerDistributionData = analysisEngine.distributionVetting(returnAsImageArray=True)
            powerDistributionImage = Image.fromarray(powerDistributionData)
            powerDistributionImage.save("powerDistributions.png")
            
            # get average aboslute power comparisons
            powerComparisonData = analysisEngine.basicComparisons(returnAsImageArray=True)
            powerComparisonImage = Image.fromarray(powerComparisonData)
            powerComparisonImage.save("powerComparisons.png")

            powerDistributionBase64= encode_image_to_base64("powerDistributions.png")
            powerComparisonBase64 = encode_image_to_base64("powerComparisons.png")
            
            # do foof analysis and display that

            # # remember to delete folder after processing
            return jsonify({"images": [
            {
                "key": "Average Power Across Bands",
                "value": "data:image/png;base64," + powerComparisonBase64
            },{
                "key": "Power Distributions Across Bands Per Epoch",
                "value": "data:image/png;base64," + powerDistributionBase64,
            }], "summary": "Steady State Frequency Averages from Recordings"}), 200

    except Exception as e:
        print("error", e)
        return jsonify({'error': str(e)}), 500

def validate_eeg_file(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        if 'eegFile' not in request.files:
            return jsonify({'error': 'No EEG file submitted for processing'}), 400
        return func(*args, **kwargs)
    return wrapper

@app.route('/api/v1/process_visual_oddball', methods=['POST'])
@validate_eeg_file
def process_visual_oddball():
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import mne
    import json
    import io
    try:
        eegFile = request.files['eegFile']
        samplingFrequency = int(request.form['samplingFrequency'])
        stimulusFile = request.files['stimulusFile']

        # assumptions, eeg file is csv.. situmuls file is .json
        eeg_df = pd.read_csv(eegFile)
        eeg_df.drop(columns=['index'], inplace=True)
        sfreq = samplingFrequency

        # Find periods of interest that overlap both eeg and stimulus
        eeg_timestamps = eeg_df['unixTimestamp'].tolist()
        eeg_timestamps_range = (min(eeg_timestamps), max(eeg_timestamps))
        stimulus_json = json.loads(stimulusFile.read().decode('utf-8'))
        filtered_json_events = [trial for trial in stimulus_json['trials'] if 'unixTimestamp' in trial and 
                            eeg_timestamps_range[0] <= trial['unixTimestamp'] <= eeg_timestamps_range[1]]
        if len(filtered_json_events) == 0:
            raise ValueError("No valid events found after filtering with the CSV timestamps range.")
        
        # Create MNE events array from filtered JSON events
        event_id = {'standard': 1, 'oddball': 2}
        events = []
        start_time = eeg_timestamps[0] / 1e3  # Convert to seconds #TODO: check if it's in milliseconds first
        for trial in filtered_json_events:
            if 'value' in trial:
                if 'oddball' in trial['value']:
                    event_type = event_id['oddball']
                elif 'standard' in trial['value']:
                    event_type = event_id['standard']
                else:
                    continue
                event_time = trial['unixTimestamp'] / 1e3  # Convert to seconds
                event_sample = int((event_time - start_time) * sfreq)
                events.append([event_sample, 0, event_type])

        events = np.array(events)
        if len(events) == 0:
            raise ValueError("No valid events found for creating epochs.")
        
        # Create MNE Raw object
        info = mne.create_info(ch_names=list(eeg_df.columns[1:]), sfreq=sfreq, ch_types='eeg')
        eeg_df = eeg_df.values[:, 1:].T
        eeg_df *= 1e-6 # convert from uV to V
        raw = mne.io.RawArray(eeg_df, info)
        raw.set_montage('standard_1020')

        lfreq = 1
        ufreq = 40

        # Filter the data
        raw.filter(lfreq, ufreq, fir_design='firwin')

        # Create epochs
        epochs = mne.Epochs(raw, events, event_id, tmin=-0.2, tmax=0.8, baseline=(None, 0), preload=True)
        
        # Compute the average ERP for each condition
        evoked_standard = epochs['standard'].average()
        evoked_oddball = epochs['oddball'].average()

        print("ERP data computed.")

        # Plot the ERP for the standard and oddball stimulus
        print("Plotting ERP for standard and oddball stimulus...")
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        fig.suptitle('ERP for Standard and Oddball Stimulus')
        
        for idx, ch_name in enumerate(evoked_standard.ch_names):
            ax = axes[idx // 2, idx % 2]
            
            # Plot standard ERP
            ax.plot(evoked_standard.times, evoked_standard.data[idx], 
                    label='Standard', color='blue')

            # Plot oddball ERP
            ax.plot(evoked_oddball.times, evoked_oddball.data[idx], 
                    label='Oddball', color='red')

            # Calculate and plot the difference waveform (Oddball - Standard)
            # difference_wave = evoked_oddball.data[idx] - evoked_standard.data[idx]
            # ax.plot(evoked_standard.times, difference_wave, 
            #         label='Difference (Oddball - Standard)', color='green')
            
            ax.axvline(0, color='k', linestyle='--', label='Stimulus Onset')
            ax.set_title(f'Channel: {ch_name}')
            ax.set_xlabel('Time (s)')
            ax.set_ylabel('Amplitude (µV)')
            ax.legend()
            ax.grid(True)
        
        plt.tight_layout()
        
        # Save the plot to a BytesIO object
        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png')
        img_buffer.seek(0)
        
        # Encode the image to base64
        img_str = base64.b64encode(img_buffer.getvalue()).decode()
        
        # Create a dictionary with the image data
        erp_plot = {
            "key": "ERP Standard vs Oddball (All Channels)",
            "value": f"data:image/png;base64,{img_str}",
            "summary": "ERP plot for standard and oddball stimulus across all channels.\n Filtered between 1 and 40 Hz. Using MNE firwin"
        }
        plt.close() 

        return jsonify({'images': [erp_plot], 'summary': "ERP Standard vs Oddball (All Channels)"}), 200
    except Exception as e:
        return jsonify({'error': 'error processing', 'message': e}), 500

@app.route('/api/v1/process_eeg_fooof', methods=['POST'])
def process_eeg_fooof():
    """
    When a person uploads an EEG file, we need to process it and return the FOOOF results
    as images"""
    try:
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        from fooof import FOOOFGroup
        import mne
        import io
        import base64
        import time

        # Check if the POST request contains a file with the key 'file'
        if 'eegFile' not in request.files:
            return jsonify({'error': 'No EEG file submitted for processing'}), 400

        eegFile = request.files['eegFile']
        samplingFrequency = int(request.form['samplingFrequency'])

        # Check if the file has a filename
        if eegFile.filename == '':
            return jsonify({'error': 'No selected EEG file'}), 400

        if eegFile.filename.endswith('.csv'):
            # Read the CSV file into a pandas DataFrame
            df = pd.read_csv(eegFile)
            df.drop(columns=['index'], inplace=True)
            sfreq = samplingFrequency
            info = mne.create_info(ch_names=list(df.columns[1:]), sfreq=sfreq, ch_types='eeg')
            
            # transpose data
            df = df.values[:, 1:].T
            df *= 1e-6 # convert from uV to V
            raw = mne.io.RawArray(df, info)
            raw.set_montage('standard_1020')

            events = mne.make_fixed_length_events(raw, duration=5)
            epochs = mne.Epochs(raw, events, tmin=0, tmax=0.5, baseline=None, reject={'eeg': 100e-3})

            epochsSpectrum = epochs.compute_psd(fmin=1, fmax=40, method='welch', verbose=False)
            
            fg = FOOOFGroup(peak_width_limits=[1.0, 8.0], min_peak_height=0.1, peak_threshold=2.)
            fg.fit(epochsSpectrum.freqs, epochsSpectrum.average().get_data(), freq_range=[1, 40])

            temp_dir = 'fooof_outputs'
            os.makedirs(temp_dir, exist_ok=True)
            file_name = f"fooof_results_{int(time.time())}.png"
            fg.save_report(file_name, file_path=temp_dir)

            images = [{
                "key": "FOOOF - Group Results",
                "value": "data:image/png;base64," + encode_image_to_base64(temp_dir + "/" + file_name)
            }]

            # Get the FOOOF results for each channel
            ch_names = raw.info['ch_names']
            for i in range(len(ch_names)):
                result = fg.get_fooof(i)
                
                # Print the result
                results = result.get_results()
                results_str = (
                    f" FOOOF - POWER SPECTRUM MODEL\n\n"
                    f"The model was run on the frequency range {result.freq_range[0]:.2f} - {result.freq_range[1]:.2f} Hz\n"
                    f"Frequency Resolution is {result.freq_res:.2f} Hz\n\n"
                    f"Aperiodic Parameters (offset, exponent):\n"
                    f"{results.aperiodic_params[0]:.4f}, {results.aperiodic_params[1]:.4f}\n\n"
                    f"{len(results.peak_params)} peaks were found:\n"
                )
                for peak in results.peak_params:
                    results_str += f"CF: {peak[0]:6.2f}, PW: {peak[1]:6.3f}, BW: {peak[2]:6.2f}\n"
                results_str += (
                    f"\nGoodness of fit metrics:\n"
                    f"R^2 of model fit is {results.r_squared:.4f}\n"
                    f"Error of the fit is {results.error:.4f}"
                )
                fig, ax = plt.subplots()

                # Plot the result
                result.plot(ax=ax, show=False)
                
                # Save the plot to a BytesIO object
                img_buffer = io.BytesIO()
                fig.savefig(img_buffer, format='png')
                img_buffer.seek(0)
                plt.close(fig)
                
                # Encode the image to base64
                img_str = base64.b64encode(img_buffer.getvalue()).decode()
                
                # Add the image to the list
                images.append({
                    "key": f"FOOOF Results for {ch_names[i]}",
                    "value": f"data:image/png;base64,{img_str}",
                    "summary": results_str
                })
            
            # Plot and save topomap
            # Create a figure with exactly 5 subplots arranged in a 2x3 grid
            fig = plt.figure(figsize=(15, 10))
            gs = plt.GridSpec(2, 3)
            axes = [
                plt.subplot(gs[0, 0]),
                plt.subplot(gs[0, 1]), 
                plt.subplot(gs[0, 2]),
                plt.subplot(gs[1, 0]),
                plt.subplot(gs[1, 1])
            ]
            raw.compute_psd().plot_topomap(normalize=True, cmap='viridis', axes=axes, show=False)
            
            # Save the topomap plot to a BytesIO object
            topomap_buffer = io.BytesIO()
            fig.savefig(topomap_buffer, format='png')
            topomap_buffer.seek(0)
            plt.close(fig)
            
            # Encode the topomap to base64
            topomap_str = base64.b64encode(topomap_buffer.getvalue()).decode()
            
            # Add the topomap to the images list
            images.append({
                "key": "Power Spectrum Topomap",
                "value": f"data:image/png;base64,{topomap_str}",
                "summary": "Topographic map of power spectrum distribution across channels"
            })
            
            return jsonify({"images": images, "summary": "FOOOF Results"}), 200
        
    except Exception as e:
        print("error", e)
        return jsonify({'error': str(e)}), 500

# Endpoint for CoCoA-PAD analysis
@app.route('/api/v1/verbal_fluency', methods=['POST'])
def verbal_fluency():
    print("request in here")
    # incoming request - audio_base64, task_type
    try:
        # call whisper to get transcript
        print("request.json", request.json)
        print("request.json['audio_base64']", request.json['audio_base64'])
        transcript = cocoa_pad.transcribe(request.json['audio_base64'])

        if not transcript:
            return jsonify({'error': 'error processing, unable to transcribe'}), 500
        
        # convert transcript to lower case, remove punctuations
        clean_transcript = re.sub(r'[^\w\s]', '', transcript.lower()).strip()

        # split transcript into words
        # TODO: support animals with multiple names
        words = clean_transcript.split(" ")
        print("split words", words)

        # words = ["cat", "dog", "parrot", "dog", "tuna", "camel", "play"]

        if request.json['task_type'] == "animal_task":
            measures = cocoa_pad.animal_task(words)

            return jsonify({'response': measures, 'transcript': transcript}), 200

        return jsonify({'response': "works perfect"}), 200
    except Exception as e:
        return jsonify({'error': 'error processing', 'message': e}), 500
    

if __name__ == '__main__':
    app.run(debug=True, port=8000)
    print("running")