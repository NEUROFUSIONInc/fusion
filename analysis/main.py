import flask
import json
import glob
import pandas as pd
import requests
import re


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


def extract_info(text):
    """
    Takes the timestamp and description from a single manual entry
    """
    # The pattern for 10-digit numbers
    pattern = r"\b\d{10}\b"
    # Extract 10-digit numbers from the text
    numbers = re.findall(pattern, text)
    # The rest of the string
    rest = re.sub(pattern, "", text)
    return numbers, rest


def extract_events_from_file(file_path):
    """
    returns in format: 
    {
        timestamp: {
            startTimestamp: timestamp,
            endTimestamp: None,
            event: {
                name: description,
                description: description,
                value: None,
            }
        }
    }
    """
    fusion_events = {}
    with open(file_path, 'r') as file:
        for line in file:
            # get out the timestamp, make the rest the "event.name"
            timestamps, description = extract_info(line)
            description = description.strip("-")

            if(len(timestamps) > 0):
                # this is assuming the timestamp is a key for the events
                fusion_events[int(timestamps[0])] = {
                    "startTimestamp": timestamps[0],
                    "endTimestamp": None,
                    "event": {
                        "name": description,
                        "description": description,
                        "value": None,
                        "source": "manual"
                    }
                }
                # fusion_events.append(fusion_event)
    return fusion_events


def preprocess_data(startTimestamp: int, endTimestamp: int = None, datatype: str = "eegPowerSpectrum"):
    """
    Accepts an array of json events with the following schema


    Return:
    if datatype is eegPowerSpectrum:
        a dataframe that contains 
        unixTimestamp, 
        <channel>_<band>_value,
        <channel>_<band>_stdvalue,
        <channel>_<band>_moving_avg

    if datatype is events:
        a dataframe that contains
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
        # TODO: implement search from blob
        file_list = get_file_list(
            "/Users/oreogundipe/lab/fusion/neuroscripts/logger/archive/data/2022/ore/powerByBand_*.json")

        print(file_list)
        event_df_list = []  # an empty list to store the data frames
        for singlefile_timestamp in file_list:
            print(
                f"comparing startTimestamp: {startTimestamp} with singlefile_timestamp: {singlefile_timestamp}")
            if(int(startTimestamp) <= int(singlefile_timestamp)):
                data = get_powerSpectrumSignalQuality(
                    singlefile_timestamp
                )
                event_df_list.append(data)  # append the data frame to the list

        # concatenate all the data frames in the list.
        final_df = pd.concat(event_df_list)
        return final_df
    if datatype == "events":

        events = extract_events_from_file(
            "/Users/oreogundipe/lab/fusion/analysis/events.txt")

        return events


def get_powerSpectrumSignalQuality(
    startTimestamp: str,
    endTimestamp: str = None,
    download: bool = False,
    options: dict = {
        "frequency_bands": ['delta', 'theta', 'alpha', 'beta', 'gamma'],
        "channels": ['CP3', 'C3', 'F5', 'PO3', 'PO4', 'F6', 'C4', 'CP4'],
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
    df_powerSpectrum = pd.read_json(
        f"/Users/oreogundipe/lab/fusion/neuroscripts/logger/archive/data/2022/deji/powerByBand_{startTimestamp}.json")
    df_signalQuality = pd.read_json(
        f"/Users/oreogundipe/lab/fusion/neuroscripts/logger/archive/data/2022/deji/signalQuality_{startTimestamp}.json")

    # average signal quality values per timestamp entries
    df_signalQuality = df_signalQuality.groupby(by="unixTimestamp").mean()
    df_signalQuality.reset_index(level=0, inplace=True)

    # average powerspectrum values per timestamp entries
    df_powerSpectrum = df_powerSpectrum.groupby(by="unixTimestamp").mean()
    df_powerSpectrum.reset_index(level=0, inplace=True)

    # set both timestamp columns to datetime
    df_powerSpectrum['unixTimestamp'] = pd.to_datetime(
        df_powerSpectrum['unixTimestamp'], unit='s', utc=True)
    df_signalQuality['unixTimestamp'] = pd.to_datetime(
        df_signalQuality['unixTimestamp'], unit='s', utc=True)

    # merge df
    df_powerSpectrum_signalQuality = df_powerSpectrum.join(
        df_signalQuality.set_index('unixTimestamp'), on='unixTimestamp')

    # rename columns
    rename_obj = {}
    for channel in options['channels']:
        rename_obj[f'{channel}_value'] = f'{channel}_stdvalue'
        for band in options['frequency_bands']:
            df_powerSpectrum_signalQuality[f'{channel}_{band}_moving_avg'] = df_powerSpectrum_signalQuality[f'{channel}_{band}'].rolling(
                options["rolling_window"]).mean()

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
    # accept timestamp & fetch data from store to process
    # - eeg
    # - events
    # - screen time

    datatypes = ["eegPowerSpectrum", "events"]
    startTimestamp = 1665633719

    for datatype in datatypes:
        mergedEEG_df = preprocess_data(
            startTimestamp=startTimestamp, endTimestamp=None, datatype=datatype)

        # you can now upload the mergedEEG_df to the backend
        url = "http://localhost:4000/api/storage/upload"
        local_path = f"/Users/oreogundipe/lab/fusion/neuroscripts/logger/archive/data/processed/{datatype}_{startTimestamp}.json"
        headers = {'Content-Type': 'application/json'}

        # TODO: validate events output
        data = {
            "provider": "fusion",
            "dataName": datatype,
            "userGuid": "460ad24b-570a-42e5-a8c4-679b86401189",
            "fileTimestamp": startTimestamp,
            "content": mergedEEG_df.to_json(orient='records')
        }
        # frontend vis can read this data when complete
        response = requests.post(url, json=data, headers=headers)

        if response.status_code == 200:
            print(response.json())
        else:
            print(response)
            print("Failed to upload file and data")

        print(mergedEEG_df.head())
