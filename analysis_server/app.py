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

import eeg

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


def encode_image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
    return encoded_string

# TODO: handle multiple files
@app.route('/api/v1/process_eeg', methods=['POST'])
def process():
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

# TODO: endpoint for ERP analysis


if __name__ == '__main__':
    app.run(debug=True, port=8000)
    print("running")