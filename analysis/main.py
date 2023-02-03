import flask
import json
import glob
import pandas as pd


def getTimestampFromPath(path):
    """
    Split the path by the underscore and get the last value - which is the timestamp
    """
    return path.split("_")[-1].split(".")[0]

def get_file_list(file_pattern: str):
    """
    example file_pattern: "/Users/oreogundipe/lab/fusion/neuroscripts/logger/archive/data/2022/deji/powerByBand_*.json"
    """
    # Get a list of all the files with a path matching the pattern
    files = glob.glob(file_pattern)

    # Iterate through each file and extract the timestamp value
    fileTimestamps = []
    for file in files:
        fileTimestamps.append((getTimestampFromPath(file)))

    return sorted(fileTimestamps)

# accept timestamp & fetch data from store to process
# - eeg
# - events
# - screen time

# start flask server
app = flask.Flask(__name__)

@app.route('/process', methods=['POST'])
def process():
    """
    Accepts:
    startTimestamp,
    endTimestamp,
    datatype - eeg, events, screenTime

    return:
    
    dataframe with preprocessed data based on type
    will make request to backend for upload after processing.
    """
    # get timestamp from request
    startTimestamp = flask.request.form['startTimestamp']
    endTimestamp = flask.request.form['endTimestamp'] 
    datatype = flask.request.form['datatype']

    # fetch data from store - call the backend api
    # data = fetch_data(timestamp)
    processed_data = preprocess_data(startTimestamp, endTimestamp, datatype)
    
    return processed_data

def preprocess_data(startTimestamp: int, endTimestamp: int = None, datatype: str = "eegPowerSpectrum"):
    """
    Accepts an array of json events with the following schema


    Return:
    if datatype is eegPowerSpectrum, 
    a json object that contains 
    unixTimestamp, 
    <channel>_<band>_value,
    <channel>_<band>_stdvalue,
    <channel>_<band>_moving_avg

    if datatype is events,
    a json array that contains
    "startTimestamp"
    "endTimestamp"
    "event":
    {
        "name": "",
        "description": "",
        "value": ""
    }
    """

    if datatype == "eegPowerSpectrum":    
        # TODO: implement
        file_list = get_file_list("/Users/oreogundipe/lab/fusion/neuroscripts/logger/archive/data/2022/deji/powerByBand_*.json")

        print(file_list)
        event_df_list = [] # an empty list to store the data frames
        for single_fileTimestamp in file_list:
            print(f"comparing startTimestamp: {startTimestamp} with single_fileTimestamp: {single_fileTimestamp}")
            if(int(startTimestamp) <= int(single_fileTimestamp)):    
                data = get_powerSpectrumSignalQuality(
                    single_fileTimestamp
                )
                event_df_list.append(data) # append the data frame to the list
        
        final_df = pd.concat(event_df_list) # concatenate all the data frames in the list.
        return final_df
    if datatype == "events":
        # read from the unixTimestamps from get_file_list
        return {
            "startTimestamp": startTimestamp,
            "endTimestamp": endTimestamp,
            "event": {
                "name": "test",
                "description": "test",
                "value": "test"
            }
        }
        

def get_powerSpectrumSignalQuality(
    startTimestamp: str, 
    endTimestamp: str = None,
    download: bool = False, 
    options: dict = {
        "frequency_bands": ['delta', 'theta', 'alpha', 'beta', 'gamma'],
        "channels": ['CP3','C3','F5','PO3', 'PO4', 'F6', 'C4','CP4'],
        "rolling_window": 5
    }
):
    """
    Merges signalQuality and powerSpectrum dataframes for a given fileset.

    options = {
        "frequency_bands": ['delta', 'theta', 'alpha', 'beta', 'gamma'],
        "channels": ['CP3','C3','F5','PO3', 'PO4', 'F6', 'C4','CP4'],
        "rolling_window": 5
    }

    Return:
    A dataframe with the following columns:
    unixTimestamp,
    <channel>_<band>_value,
    <channel>_<band>_stdvalue,
    <channel>_<band>_moving_avg
    """

    print(f"Processing {startTimestamp}...")
    # TODO:make api call to backend for particular dataset - >
    df_powerSpectrum = pd.read_json(f"/Users/oreogundipe/lab/fusion/neuroscripts/logger/archive/data/2022/deji/powerByBand_{startTimestamp}.json")
    df_signalQuality = pd.read_json(f"/Users/oreogundipe/lab/fusion/neuroscripts/logger/archive/data/2022/deji/signalQuality_{startTimestamp}.json")

    # average signal quality values per timestamp entries
    df_signalQuality = df_signalQuality.groupby(by="unixTimestamp").mean()
    df_signalQuality.reset_index(level=0, inplace=True)

    # average powerspectrum values per timestamp entries
    df_powerSpectrum = df_powerSpectrum.groupby(by="unixTimestamp").mean()
    df_powerSpectrum.reset_index(level=0, inplace=True)

    # set both timestamp columns to datetime    
    df_powerSpectrum['unixTimestamp']= pd.to_datetime(df_powerSpectrum['unixTimestamp'], unit='s', utc=True)
    df_signalQuality['unixTimestamp'] = pd.to_datetime(df_signalQuality['unixTimestamp'], unit='s', utc=True)

    # merge df
    df_powerSpectrum_signalQuality = df_powerSpectrum.join(df_signalQuality.set_index('unixTimestamp'), on='unixTimestamp')

    # rename columns
    rename_obj = {}
    for channel in options['channels']:
        rename_obj[f'{channel}_value'] = f'{channel}_stdvalue'
        for band in options['frequency_bands']:
            df_powerSpectrum_signalQuality[f'{channel}_{band}_moving_avg'] = df_powerSpectrum_signalQuality[f'{channel}_{band}'].rolling(options["rolling_window"]).mean()

    if len(rename_obj) > 0:
        df_powerSpectrum_signalQuality.rename(columns=rename_obj, inplace=True)

    if download:
        path = f"/Users/oreogundipe/lab/fusion/neuroscripts/logger/archive/data/2022/ore/powerSpectrum_signalQuality_{startTimestamp}.json"
        df_powerSpectrum_signalQuality.to_json(path, orient='records')
        print(f"Written data to {path}")

    return df_powerSpectrum_signalQuality

# tbh, i don't think I'm here yet... I think eeg data for a day summary needs to be clearer

# the goal will be then saying that your brain power average for today is

# dataset where magicflow events and eeg recordings overlap

if __name__ == "__main__":    
    mergedEEG_df = preprocess_data(startTimestamp=1665632132, endTimestamp=None, datatype="eegPowerSpectrum")

    # you can now upload the mergedEEG_df to the backend
    # provider - fusion
    # dataName - eegPowerSpectrum
    # userGuid - {}
    # content = mergedEEG_df.to_json(orient='records')

    req

    print(mergedEEG_df.head())