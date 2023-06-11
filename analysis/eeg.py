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
import os
import numpy as np
import json


data_dir = Path("/Users/oreogundipe/lab/eeg-restingstate-days")

# fusion_dir = data_dir / "eeg" / "fusion"

# the common band names, ordered by frequency
bands_ordered = ["delta", "theta", "alpha", "beta", "gamma"]

import re

def rnOccur(arr,v,n):
    for x in range(len(arr)-1,0,-1):
        if arr[x] in v:
            if n == 0: return x
            n-=1
    return -1

class extractBundledEEG: # Extracts all json eeg data wihtin a folder in conveniant bundles
    def __init__(self,fold):
        self.categories = dict()
        self.tagIdMap = dict()
        if not os.path.exists(fold): raise Exception(fold+ " is not a valid folder")
        files = []
        folds = [fold]
        while folds: 
            filesTemp = next(os.walk(folds[0]))
            folds.pop(0)
            files+=[os.path.join(filesTemp[0],x) for x in filesTemp[2]]
            folds+=[os.path.join(filesTemp[0],x) for x in filesTemp[1]]
        for f in files:
            if f[-5:] == ".json" or f[-4:] == ".csv" and "_" in f:
                id = f[f.rindex("_")+1:f.rindex(".")]

                if id not in self.tagIdMap: self.tagIdMap[id] = dict()
                
                type = f[rnOccur(f,["_","/","\\"],1)+1:f.rindex("_")]
                # print(type,id,f)

                self.tagIdMap[id][type] = f

                if type == "event":
                    with open(f,"r") as of:
                        tagInfo = json.load(of)
                        if tagInfo["event"]["description"] not in self.categories: self.categories[tagInfo["event"]["description"]] = list()
                        self.categories[tagInfo["event"]["description"]].append(id)
                        self.tagIdMap[id]["Meta"] = tagInfo

    def addMeta(self,metaCsvLoc,groupCol,timeStampCol = "startTimestamp"):  # add meta from csv table for categorization
        with open(metaCsvLoc,"r") as f:
            metaCsv = pd.read_csv(f)
            metaCsv = metaCsv.set_index(timeStampCol)
            for i,row in metaCsv.iterrows():
                i = str(i)
                if i not in self.tagIdMap:
                    print(i,"Meta available but no associated recordings")
                    continue
                if row[groupCol] not in self.categories: self.categories[row[groupCol]] = list()
                self.categories[row[groupCol]].append(i)
                meta = dict()
                for x in metaCsv.columns:
                    meta[x] = row[x]
                self.tagIdMap[i]["Meta"] = dict(row)

    def prune(self): # removes all events without all eeg files from dataset
        for x in list(self.categories.keys()):
            for y in self.categories[x]:
                # print(x,y,self.tagIdMap[y])
                if len(self.tagIdMap[y])<3:
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

# generate summary of the signalQuality across channels
def get_signal_quality_summary(signalQuality):
    channel_good_percentage = {}

    for col in signalQuality:
        if col in ['CP3_status', 'C3_status', 'F5_status', 'PO3_status', 'PO4_status', 'F6_status', 'C4_status', 'CP4_status']:
            channel_states = signalQuality[col].value_counts()
            
            no_of_okay_samples = 0

            if 'good' in channel_states:
                no_of_okay_samples += channel_states['good']
            if 'great' in channel_states:
                no_of_okay_samples += channel_states['great']

            percentage_good = no_of_okay_samples / len(signalQuality[col])

            col_name_split = col.split('_')

            channel_good_percentage[col_name_split[0]] = percentage_good

    # this helps us know what channels to discard in our analysis
    return channel_good_percentage

def load_session_epochs(files: dict, _on: set, _channels: list = [],qualityCutoffFilter: int = 0, epochSize: int = -1):
    """
    Takes a session of EEG data and the recordings concerned with and outputs filtered epochs
    qualityCutoffFilter: percentage of time electrode data is marked as "good" or "great" required for it to be included in output and analyticsl, 0 capture everything
    epochSize: epochlength in seconds
    _on: recordings to perform on, ex powerByBand or rawBrainwave

    returns dictionary of dataframes with the recordings specified in _on with epoched and filtered data
    """
    # Best channels are usually: CP3, CP4, PO3, PO4

    # NOTE: unixTimestamps are int/seconds but samples more often than 1Hz,
    #       so several rows per timestamp and missing sub-second resolution.

    _on+=["signalQuality","powerByBand"]
    
    _on = set(_on)
    on = dict()
    for x in _on:
        if str(files[x]).endswith(".csv"):
            on[x] = pd.read_csv(files[x])
        else:
            on[x] = pd.read_json(files[x])

    for x in on:
        on[x].rename(columns={"timestamp": "unixTimestamp"},inplace=True)
        on[x]["epoch"] = on[x]["unixTimestamp"].copy(deep=True)
        if str(on[x]["epoch"].dtype) == "datetime64[ns]":
            on[x]["epoch"] = on[x]["epoch"].astype(int) / 10**9
    
        try:
            on[x]["unixTimestamp"] =  pd.to_datetime(on[x]["unixTimestamp"], unit="s")
        except:

            on[x]["epoch"] = np.floor(on[x]["epoch"] / 1000)
            on[x]["unixTimestamp"] =  pd.to_datetime(on[x]["unixTimestamp"], unit="ms")

        on[x].set_index("unixTimestamp",drop=False, inplace=True)

    if epochSize == -1: epochSize = (on["signalQuality"].index[on["signalQuality"].shape[0]-1]-on["signalQuality"].index[0]).seconds
    for x in on: 
        on[x]["epoch"] = epochSize*np.floor(on[x]["epoch"]/epochSize)
        on[x] = on[x].set_index(["epoch","unixTimestamp"])

    df_sigQ = on["signalQuality"]

    channels, bands = zip(*[c.split("_") for c in on["powerByBand"].columns[1:-2]])
    channels, bands = list(set(channels)), list(set(bands))
    
    onChan = {} # generate dictionary that maps channels to related columns
    for df in on:
        onChan[df] = {x: [y for y in on[df].columns if x in y] for x in channels}

    if _channels != []:
        removed = [x for x in channels if x not in _channels]
        for x in on:
            on[x].drop([col for col in on[x].columns if len([r for r in removed if r in col])>0], axis=1)
        channels = _channels

    onChan = {}
    for df in on:
        onChan[df] = {x: [y for y in on[df].columns if x in y] for x in channels}
        onChan[df] = {x : onChan[df][x] for x in onChan[df] if len(onChan[df][x])>0}

    goodEpochStampsPerChan = {x: set() for x in channels}
    goodEpochStamps = {}
    # for x in [onChan["signalQuality"][x][1] for x in onChan["signalQuality"]]:
    #     print(df_sigQ.groupby(level=[0])[x].value_counts())
    #     break
    #     # for y in df_sigQ.groupby(level=[0])[x].value_counts():
            
    
        

    for x in set(df_sigQ.index.get_level_values(0)):
        sigSamp = df_sigQ.loc[x,:]
        for channel in channels:
            col = channel + "_status"
            channel_states = sigSamp[col].value_counts()
            no_of_okay_samples = 0
            if 'good' in channel_states:
                no_of_okay_samples += channel_states['good']
            if 'great' in channel_states:
                no_of_okay_samples += channel_states['great']

            percentage_good = no_of_okay_samples / sigSamp.shape[0]
            if percentage_good>=qualityCutoffFilter:
                if x not in goodEpochStamps: goodEpochStamps[x] = [channel]
                else: goodEpochStamps[x].append(channel)

                goodEpochStampsPerChan[channel].add(x)

    goodEpochSerial = {}
    for i,x in enumerate(goodEpochStamps.keys()):
        goodEpochSerial[x] = i

    
    for x in on:
        on[x]["_epoch"] = on[x].index.get_level_values(0)
        if x != "signalQuality":
            for channel in onChan[x]:
                badStamps = set(on[x]["_epoch"]).difference(goodEpochStampsPerChan[channel])
                if len(badStamps) != 0:
                    on[x].loc[list(badStamps),onChan[x][channel]] = pd.NA


        badStamps = set(on[x]["_epoch"]).difference(goodEpochSerial.keys())
        on[x].loc[list(badStamps),"_epoch"] = pd.NA
        on[x]["_epoch"] = on[x]["_epoch"].replace(goodEpochSerial)


        # print(on[x])

   

    for x in on:
        on[x].reset_index(inplace=True)
        on[x].drop(columns=["epoch"],inplace=True)
        on[x].rename(columns={"_epoch":"epoch"},inplace=True)
        on[x] = on[x].set_index(["epoch","unixTimestamp"])

    # on["signalQuality"].to_csv("EpochValidate.csv")
        
    return on


def get_rolling_powerByBand(powerByBand, signalQuality, window_size=5):
    # we want to split the recording for a session in to 5sec chunks average
    # see if there's any difference in the average. 

    # we will discard any channels that have less than 70% good samples
    channel_good_percentage = get_signal_quality_summary(signalQuality)

    # we will discard any channels that have less than 70% good samples
    for entry in channel_good_percentage:
        if channel_good_percentage[entry] < 0.7:
            del powerByBand[entry + '_alpha']
            del powerByBand[entry + '_beta']
            del powerByBand[entry + '_delta']
            del powerByBand[entry + '_gamma']
            del powerByBand[entry + '_theta']

    # we will split the recording in to 5sec chunks
    powerByBand_rolling = powerByBand.median() #.rolling(window=window_size).mean()

    # we will discard the first 5sec of the recording
    # powerByBand_rolling = powerByBand_rolling[window_size:]

    return powerByBand_rolling

# TODO specify channels 
def load_session(files: dict, QualityCutoffFilter=0) -> dict:
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