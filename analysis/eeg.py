"""
Originally authored by @erikbjare,
https://github.com/ErikBjare/quantifiedme/blob/master/src/quantifiedme/load/eeg.py

modified by @oreogundipe

Load EEG data into a pandas dataframe.

We will load data from Neurosity's file exports provided by Neurofusion.

We will also load signal quality data, to help us filter out bad data.
"""

from pathlib import Path
from collections import defaultdict

import pandas as pd
import datetime
import pytz

data_dir = Path("/Users/oreogundipe/lab/eeg-restingstate-days")

# fusion_dir = data_dir / "eeg" / "fusion"

# the common band names, ordered by frequency
bands_ordered = ["delta", "theta", "alpha", "beta", "gamma"]


import os
import json
import re

def rnOccur(arr,v,n):
    for x in range(len(arr)-1,0,-1):
        if arr[x] == v:
            if n == 0: return x
            n-=1
    return -1

class extractBundledEEG: # Extracts all json eeg data wihtin a folder in conveniant bundles
    def __init__(self,fold):
        self.categories = dict()
        self.tagIdMap = dict()
        files = next(os.walk(fold))
        for f in files[2]:
            if f[-5:] == ".json":
                id = f[f.rindex("_")+1:-5]

                if id not in self.tagIdMap: self.tagIdMap[id] = dict()
                
                type = f[rnOccur(f,"_",1)+1:f.rindex("_")]
                # print(type,id,f)

                self.tagIdMap[id][type] = os.path.join(files[0],f)

                if type == "event":
                    with open(os.path.join(files[0],f),"r") as of:
                        tagInfo = json.load(of)["event"]["description"]
                        if tagInfo not in self.categories: self.categories[tagInfo] = list()
                        self.categories[tagInfo].append(id)

    def prune(self): # removes all events without all eeg files from dataset
        for x in list(self.categories.keys()):
            for y in self.categories[x]:
                print(x,y,self.tagIdMap[y])
                if len(self.tagIdMap[y])<2:
                    self.categories[x].remove(y)
                    del self.tagIdMap[y]


            if len(self.categories[x]) == 0: del self.categories[x]

    def extractById(self, id): # extracts all json file locs with aan associated with an event id
        return self.tagIdMap[str(id)]
    
    def extractByTags(self, tag): #extract based on tags
        ret = dict()
        for x in self.categories[str(tag)]:
            ret[x] = self.tagIdMap[x]
        return ret

    def mergeTagsWithRegex(self,reg,newTag): # merge tags that have matching regex
        newCategory = list()
        oldTags = list()
        for tag in self.categories:
            if re.search(reg,tag):
                newCategory+= list(self.categories[tag])
                oldTags.append(tag)
        for tag in oldTags: del self.categories[tag]

        self.categories[newTag] = newCategory

    def mergeCategories(self,categories,newTag): # merge two tag groups
        newCategory = list()
        oldTags = list()
        for tag in categories:
                newCategory+= list(self.categories[tag])
                oldTags.append(tag)
        for tag in oldTags: del self.categories[tag]

        self.categories[newTag] = newCategory


def load_data():
    filesets = load_fileset()
    df = pd.DataFrame()
    for timestamp, files in filesets.items():
        result = load_session(files)
        # pprint(result)
        df = df.append(result, ignore_index=True)
    return df


def load_session(files: dict) -> dict:
    """
    Takes a session of EEG data, computes some metrics, and returns them.

    Potential metrics:
     - average power by band
     - average power by channel
     - relative power by band
     - average focus/calm score
    """
    # Best channels are usually: CP3, CP4, PO3, PO4

    # NOTE: unixTimestamps are int/seconds but samples more often than 1Hz,
    #       so several rows per timestamp and missing sub-second resolution.
    df_pbb = pd.read_json(files["powerByBand"])
    df_pbb.set_index("unixTimestamp", inplace=True)
    df_pbb.index = pd.to_datetime(df_pbb.index, unit="s")

    # we have to deal with the channels, such as CP3_alpha, CP3_beta, etc.
    # for now, we will just average them all together
    channels, bands = zip(*[c.split("_") for c in df_pbb.columns])
    channels, bands = list(set(channels)), list(set(bands))

    df = pd.DataFrame(index=df_pbb.index)
    for band in bands:
        channels_with_band = [c for c in df_pbb.columns if c.endswith(band)]
        df[band] = df_pbb[channels_with_band].mean(axis=1)
    average_band_power = df.mean()[bands_ordered]

    df = pd.DataFrame(index=df_pbb.index)
    for channel in channels:
        bands_for_channel = [c for c in df_pbb.columns if c.startswith(channel)]
        df[channel] = df_pbb[bands_for_channel].mean(axis=1)
    average_channel_power = df.mean()[channels]

    # TODO: split into low(0.3-0.6), medium(0.6-0.7), high(0.7-1.0)
    df_calm = pd.read_json(files["calm"])
    avg_calm_score = df_calm["probability"].mean()
    time_spent_calm = (df_calm["probability"] > 0.3).sum() / len(df_calm)

    df_focus = pd.read_json(files["focus"])
    avg_focus_score = df_focus["probability"].mean()
    time_spent_focused = (df_focus["probability"] > 0.3).sum() / len(df_focus)

    unix_timestamp = int(df_pbb.index[0].timestamp())

    
    return {
        "timestamp": unix_timestamp,
        "local_date": unix_to_localdate(unix_timestamp),
        "local_timeofday": unix_to_period(unix_timestamp),
        "duration": df_pbb.index[-1] - df_pbb.index[0],
        "avg_power_per_channel_by_band": {
            channel: {band: df_pbb[channel + "_" + band].mean() for band in bands}
            for channel in channels
        },
        "avg_power_by_band": dict(average_band_power),
        "avg_power_by_channel": dict(average_channel_power),
        "avg_calm_score": avg_calm_score,
        "avg_focus_score": avg_focus_score,
        "time_spent_calm": time_spent_calm,
        "time_spent_focused": time_spent_focused,
        # `relative_power` keys are 2-tuples (band1, band2), values are ratios
        # maybe doesn't need to be computed here,
        # can be computed later from `avg_power_by_band`
        # "relative_power": {},
        #"signal_quality" based on the signal quality data
    }

def unix_to_period(unix_timestamp):
    # convert the Unix timestamp to a datetime object
    dt_object = datetime.datetime.fromtimestamp(unix_timestamp, pytz.timezone('America/Vancouver'))
    
    # extract the hour from the datetime object
    hour = dt_object.hour
    
    # determine the period of the day based on the hour
    if hour < 12:
        return "morning"
    elif hour < 18:
        return "afternoon"
    else:
        return "evening"

def unix_to_localdate(unix_timestamp):
    # convert the Unix timestamp to a datetime object
    dt_object = datetime.datetime.fromtimestamp(unix_timestamp, pytz.timezone('America/Vancouver'))
    
    # extract the hour from the datetime object
    date = dt_object.strftime("%Y-%m-%d %H:%M")

    return date

def load_sessions():
    """Loads all sessions of EEG data, compute & return metric for each session."""
    filesets = load_fileset()
    sessions: dict[str, dict] = {}
    for timestamp, files in filesets.items():
        sessions[timestamp] = load_session(files)
    return sessions


def load_fileset(
    dir=data_dir,
):
    """
    Iterated over files in a directory with recordings,
    groups them by their session/start timestamp,
    and returns the filenames for each session as a dict.
    """
    print(data_dir)
    files = list(dir.glob("*.json"))
    print(files)
    files.sort()
    sessions: dict[str, dict[str, str]] = defaultdict(dict)
    for f in files:
        if f.stem == "events":
            continue
        *type, session = f.stem.split("_")
        sessions[session]["_".join(type)] = str(f)
    return sessions


if __name__ == "__main__":
    df = load_data()
    print(df)
    print(df.describe())