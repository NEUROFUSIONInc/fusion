"""
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
import copy
import matplotlib.pyplot as plt
from matplotlib.backends.backend_agg import FigureCanvasAgg
import io

timezone = 'America/Vancouver'


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

    def getCategories(self):
        return self.categories

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
    
    def extractByTags(self, tag): #extract based on tags in event json
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

def load_session_epochs(files: dict, _on: set, _channels: list = [],qualityCutoffFilter: float = 0, epochSize: int = -1):
    """
    Takes a session of EEG data and the recordings concerned with and outputs filtered epochs

        _on: recordings to perform on, ex powerByBand or rawBrainwave
        qualityCutoffFilter: percentage of time electrode data is marked as "good" or "great" required for it to be included in output and analyticsl, 0 capture everything
        _channels: white list of channels to include in epochs returned
        epochSize: epochlength in seconds
    

    returns dictionary of dataframes with the recordings specified in _on, with a column representing the epoch segments of data belong to and NA marking filtered out data
    """


    # ingest all selected recordings into dfs
    _on+=["signalQuality","powerByBand"]
    _on = set(_on)

    on = dict()
    for x in _on:
        if str(files[x]).endswith(".csv"):
            on[x] = pd.read_csv(files[x])
        else:
            on[x] = pd.read_json(files[x])


    # Standerdize and process recordings
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


    # Super dope and awesome efficent vectorized epoching algorithm
    if epochSize == -1: epochSize = (on["signalQuality"].index[on["signalQuality"].shape[0]-1]-on["signalQuality"].index[0]).seconds
    for x in on: 
        on[x]["epoch"] = epochSize*np.floor(on[x]["epoch"]/epochSize)
        on[x] = on[x].set_index(["epoch","unixTimestamp"])

    df_sigQ = on["signalQuality"]

    channels, bands = zip(*[c.split("_") for c in on["powerByBand"].columns[1:-2]])
    channels, bands = list(set(channels)), list(set(bands))

    # removes channels from dfs if not in whitelist
    if _channels != []:
        removed = [x for x in channels if x not in _channels]
        for x in on:
            on[x].drop([col for col in on[x].columns if len([r for r in removed if r in col])>0], axis=1)
        channels = _channels


    # generate dictionary that maps channels to related columns
    onChan = {}
    for df in on:
        onChan[df] = {x: [y for y in on[df].columns if x in y] for x in channels}
        onChan[df] = {x : onChan[df][x] for x in onChan[df] if len(onChan[df][x])>0}

    for x in onChan["powerByBand"]:
        maparr = on["powerByBand"][onChan["powerByBand"][x][2]]>20
        on["powerByBand"].loc[maparr,onChan["powerByBand"][x]] = pd.NA
        


    goodEpochStampsPerChan = {x: set() for x in channels}
    goodEpochStamps = {}
    # for x in [onChan["signalQuality"][x][1] for x in onChan["signalQuality"]]:
    #     print(df_sigQ.groupby(level=[0])[x].value_counts())
    #     break
    #     # for y in df_sigQ.groupby(level=[0])[x].value_counts():
            
    
    # Generate Epoch Quality Filter
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
            # print("percentage_good", percentage_good)
            # print("no_of_okay_samples", no_of_okay_samples)
            # print("total_samples", sigSamp.shape[0])
            if percentage_good>=qualityCutoffFilter:
                if x not in goodEpochStamps: goodEpochStamps[x] = [channel]
                else: goodEpochStamps[x].append(channel)

                goodEpochStampsPerChan[channel].add(x)


    goodEpochSerial = {}
    for i,x in enumerate(goodEpochStamps.keys()): # number remaining good epochs
        goodEpochSerial[x] = i

    # Apply filtering to recordings
    for x in on:
        on[x]["_epoch"] = on[x].index.get_level_values(0)
        if on != "signalQuality":
            for channel in onChan[x]:
                badStamps = set(on[x]["_epoch"]).difference(goodEpochStampsPerChan[channel])
                if len(badStamps) != 0:
                    on[x].loc[list(badStamps),onChan[x][channel]] = pd.NA


        badStamps = set(on[x]["_epoch"]).difference(goodEpochSerial.keys())
        on[x].loc[list(badStamps),"_epoch"] = pd.NA
        on[x]["_epoch"] = on[x]["_epoch"].replace(goodEpochSerial)
   


    # Format dfs before return
    for x in on:
        on[x].reset_index(inplace=True)
        on[x].drop(columns=["epoch"],inplace=True)
        on[x].rename(columns={"_epoch":"epoch"},inplace=True)
        on[x] = on[x].set_index(["epoch","unixTimestamp"])

    # on["signalQuality"].to_csv("EpochValidate.csv")
        
    return on

def load_session_summery(files: dict, _channels: list = [], qualityCutoffFilter: int = 0, epochSize: int = -1, returnEpoched = False, debug=False) -> dict:
    """
    Takes a session of EEG data, computes some metrics, and returns them.
    
        _channels: whitelist of channels included in summery
        qualityCutoffFilter: percentage of time electrode data is marked as "good" or "great" required for it to be included in output and analytics, default: capture everything
        epochSize: the window to sample on (seconds) default: epoch the entire dataset
        returnEpoched: if false, returns average over all the epochs that achieved quality threshold, if true generates a summary per epoch
        debug: print debugging messages

    Metrics returned in dict:
        - timestamp of epoch begining
        - local_date
        - local_timeofday
        - epoch duration
        - avg_power_per_channel_by_band
        - avg_power_by_band
        - avg_power_by_channel
        - avg_calm_score
        - avg_focus_score
        - time_spent_calm
        - time_spent_focused
        - relative_power
        - signal_quality

    """

    epochs = load_session_epochs(files,_on=["powerByBand","calm","focus","signalQuality"], _channels = _channels ,qualityCutoffFilter=qualityCutoffFilter,epochSize=epochSize)

    channels, bands = zip(*[c.split("_") for c in epochs["powerByBand"].columns[1:-1]])
    channels, bands = list(set(channels)), list(set(bands))

    if _channels!=[]:
        channels = _channels

    removedChannels = []

    for x in channels: 
        # print(temporalFilter[x].value_counts())
        #  just check that there's at least some value in the channel
        validEpochs = ~epochs["powerByBand"][x+"_delta"].isna()
        if True not in validEpochs.value_counts():
            removedChannels.append(x)
            channels.remove(x)
        else:
            percentLost = 1-(validEpochs.value_counts()[True]/validEpochs.shape[0])
            if percentLost > .4 and debug:
                print(f"{int(percentLost*100)}% of {x} Pruned for lack of quality")
            if percentLost>.9:
                removedChannels.append(x)
                channels.remove(x)

    epochStruct = {"timestamp": None,
            "local_date": None,
            "local_timeofday": None,
            "duration": None,
            "avg_power_per_channel_by_band": dict(),
            "avg_power_by_band": dict(),
            "avg_power_by_channel": dict(),
            "avg_calm_score": None,
            "avg_focus_score": None,
            "time_spent_calm": None,
            "time_spent_focused": None,
            "relative_power": None,
            "signal_quality": None
            }

    epochReturnStruct = {}

    if not returnEpoched:
        for x in epochs:
            epochs[x]=epochs[x].reset_index()
            epochs[x]["epoch"]=0
            epochs[x] = epochs[x].set_index(["epoch","unixTimestamp"]).sort_index()

    for epochInd in set(list(zip(*epochs["powerByBand"].index))[0]):
        if pd.isna(epochInd): continue
        pbbEpochDf = epochs["powerByBand"].loc[epochInd,:]
        epochTemp = copy.deepcopy(epochStruct)

        df = pd.DataFrame(index=pbbEpochDf.index) 
        for channel in channels:
            bands_for_channel = [c for c in pbbEpochDf.columns if c.startswith(channel)]
            df[channel] = pbbEpochDf[bands_for_channel].mean(axis=1)
        epochTemp["avg_power_by_channel"] = dict(df.mean()[channels])
        df = pd.DataFrame(index=pbbEpochDf.index)

        for band in bands:
            channels_with_band = [c for c in pbbEpochDf.columns if c.endswith(band) and c.split("_")[0] not in removedChannels]
            df[band] = pbbEpochDf[channels_with_band].mean(axis=1)

        epochTemp["avg_power_by_band"] = dict(df.mean()[bands_ordered])
        epochTemp["avg_power_per_channel_by_band"] = {channel: {band: pbbEpochDf[channel + "_" + band].mean() for band in bands}
                    for channel in channels}
        
        epochTemp["timestamp"] = int(pbbEpochDf.index[0].timestamp())
        epochTemp["duration"] =  pbbEpochDf.index[-1] - pbbEpochDf.index[0]
        epochTemp["local_date"] = unix_to_localdate(epochTemp["timestamp"])
        epochTemp["local_timeofday"] = unix_to_period(epochTemp["timestamp"])


        if epochInd in epochs["calm"].index.get_level_values(0):
            df_calm = epochs["calm"].loc[epochInd,:]
            epochTemp["avg_calm_score"] = df_calm["probability"].mean()
            epochTemp["time_spent_calm"] = (df_calm["probability"] > 0.3).sum() / len(df_calm)

        if epochInd in epochs["focus"].index.get_level_values(0):
            df_focus = epochs["focus"].loc[epochInd,:]
            epochTemp["avg_focus_score"] = df_focus["probability"].mean()
            epochTemp["time_spent_focused"] = (df_focus["probability"] > 0.3).sum() / len(df_focus)


        relativePower = dict()
        for channel in channels:
            totalPower = 0
            for band in bands:
                totalPower+=epochTemp["avg_power_per_channel_by_band"][channel][band]
            for band in bands:
                if channel not in relativePower: relativePower[channel] = dict()
                relativePower[channel][band] = epochTemp["avg_power_per_channel_by_band"][channel][band]/totalPower

        epochTemp["relative_power"] = relativePower
        epochTemp["signal_quality"] = get_signal_quality_summary(epochs["signalQuality"].loc[epochInd,:])



        epochReturnStruct[epochInd] = epochTemp

    if not returnEpoched: epochReturnStruct = epochReturnStruct[0]

    return epochReturnStruct

class analysisEngine():
    def __init__(self,fileBundles: dict,epochSize=5, qualityCutoffFilter=0.95, debug = False, bundleType="tags"):
        """
        Generates basic analytics for recording groups
        
        fileBundles: {recordingsTagName:[set of recordingIds when using extractByTags] / {single file bundle when using extractById}, tagName: ....}: 
        dictionary of labeled filebundles as generated from extractBundledEEG

        epochSize: epoch size to use in seconds

        qualityCutoffFilter: % of required good recordings to accept epoch for analysis

        bundleType: "tags" or "ids" depending on if fileBundles is a dict of tags or ids
        
        """
        self.fileBundles = fileBundles
        self.fileBundleSummeries = {x:[] for x in self.fileBundles}


        for x in self.fileBundles:
            # check if bundle contains single or multiple recordings
            # main different is if it's a dict or list...
            sum = 0
            if bundleType == "tags": # this means it's a dict of datasets based on tags
                # this means it's an array of datasets based on tags
                for y in self.fileBundles[x]:
                    self.fileBundleSummeries[x].append(load_session_summery(self.fileBundles[x][y],qualityCutoffFilter=qualityCutoffFilter,epochSize=epochSize,returnEpoched=True,debug=debug))
                    sum += len(self.fileBundleSummeries[x][-1])
            elif bundleType == "ids":
                self.fileBundleSummeries[x].append(load_session_summery(self.fileBundles[x],qualityCutoffFilter=qualityCutoffFilter,epochSize=epochSize,returnEpoched=True,debug=debug))
                sum += len(self.fileBundleSummeries[x])
            else:
                raise Exception("Invalid bundleType")

        # generate file bundle stats
        self.computeFileBundleStats()
            
    def computeFileBundleStats(self):
        # Generates a dictionary of all the powerband values for epochs in recording groups
        self.accumulatedPowerBands = {x:dict() for x in self.fileBundles}
        for x in self.fileBundles: # Basic sanity checks of distributions
            for y in self.fileBundleSummeries[x]:
                for epoch in y:
                    for band in y[epoch]["avg_power_by_band"]:
                        if band not in self.accumulatedPowerBands [x]: self.accumulatedPowerBands [x][band] = []
                        self.accumulatedPowerBands [x][band].append(y[epoch]["avg_power_by_band"][band])
 
        self.accumulatedPowerBandStats = {x:dict() for x in self.fileBundles}
        self.accumulatedPowerBandErrors = {x:dict() for x in self.fileBundles}

        for x in self.accumulatedPowerBands: # avgs with error bars
            for band in self.accumulatedPowerBands[x]:
                self.accumulatedPowerBandStats[x][band] = np.nanmean(np.array(self.accumulatedPowerBands[x][band]))
                # print(np.array(accumulatedPowerBands[x][band]))
                self.accumulatedPowerBandErrors[x][band] = np.nanstd(np.array(self.accumulatedPowerBands[x][band])) * 2


    # Generates histogram on epochs average powerband values for inspection of distrobutions
    def distributionVetting(self, returnAsImageArray=False):

        if returnAsImageArray:
            plt.switch_backend('Agg') 

            num_bands = len(bands_ordered)
            num_files = len(self.fileBundles)
            
            fig, axes = plt.subplots(num_bands, 1, figsize=(8, 6 * num_bands))
            
            for count, band in enumerate(bands_ordered):
                ax = axes[count]
                for x in self.fileBundles:
                    ax.hist(self.accumulatedPowerBands[x][band], alpha=0.5, bins=160, label=x)

                ax.set_title(f'{band} Epoch Averages')
                ax.legend()
                ax.set_xlabel('uV')
                ax.set_ylabel('Count')
                ax.grid(True)
            
            # Render the figure to an Agg backend (image buffer)
            canvas = FigureCanvasAgg(fig)
            canvas.draw()

            # Convert the Agg buffer to a NumPy array
            img_data = np.frombuffer(canvas.tostring_rgb(), dtype='uint8')
            img_data = img_data.reshape(fig.canvas.get_width_height()[::-1] + (3,))

            return img_data
        else:
            count = 0
            for band in bands_ordered:
                count+=1
                for x in self.fileBundles:
                    plt.subplot(5, 1, count)
                    plt.hist(self.accumulatedPowerBands [x][band],alpha=0.5,bins=160,label=x)
                    
                plt.title(f'{band} Epoch Averages')
                plt.legend()
                plt.xlabel('uV')
                plt.ylabel('Count')
                plt.grid(True)
                plt.show()
    

    # basic bar chart of powerbybands comparing between catergories with error bars encompassing 95% confidence interval assuming normal distrobutions
    def basicComparisons(self, returnAsImageArray=False):
        if returnAsImageArray:
            plt.switch_backend('Agg') 

            fig, ax = plt.subplots()
            bar_width = .3
            currentBarDist = bar_width
            figs = {x:0 for x in self.fileBundles}
            index = np.arange(5)
            for x in self.accumulatedPowerBandStats:
                print(x,self.accumulatedPowerBandStats[x])
                ax.bar(index+currentBarDist,list(self.accumulatedPowerBandStats[x].values()), bar_width,
                            label=x,yerr=list(self.accumulatedPowerBandErrors[x].values()))
                currentBarDist+=bar_width

            ax.set_xticks(index + bar_width / 2)
            ax.set_xticklabels(self.accumulatedPowerBandStats[x].keys())
            ax.set_xlabel('Band')
            ax.set_ylabel('Average Power (uV^2)')
            ax.set_title('Average Power (uV^2) by Band')
            ax.legend()

            # Render the figure to an Agg backend (image buffer)
            canvas = FigureCanvasAgg(fig)
            canvas.draw()

            # Convert the Agg buffer to a NumPy array
            img_data = np.frombuffer(canvas.tostring_rgb(), dtype='uint8')
            img_data = img_data.reshape(fig.canvas.get_width_height()[::-1] + (3,))

            return img_data
        else:   
            fig, ax = plt.subplots()
            bar_width = .3
            currentBarDist = bar_width
            figs = {x:0 for x in self.fileBundles}
            index = np.arange(5)
            for x in self.accumulatedPowerBandStats:
                print(x,self.accumulatedPowerBandStats[x])
                ax.bar(index+currentBarDist,list(self.accumulatedPowerBandStats[x].values()), bar_width,
                            label=x,yerr=list(self.accumulatedPowerBandErrors[x].values()))
                currentBarDist+=bar_width

            ax.set_xticks(index + bar_width / 2)
            ax.set_xticklabels(self.accumulatedPowerBandStats[x].keys())
            ax.set_xlabel('Band')
            ax.set_ylabel('Average Power (uV^2)')
            ax.set_title('Average Power (uV^2) by Band')
            ax.legend()

            plt.show()


"""
Old methods that need to be reviewed/removed.
"""
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
    dt_object = datetime.datetime.fromtimestamp(unix_timestamp, pytz.timezone(timezone))
    
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
    dt_object = datetime.datetime.fromtimestamp(unix_timestamp, pytz.timezone(timezone))
    
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