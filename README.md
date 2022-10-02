# Fusion
What do we find when we stop treating our usage data across apps as a by-product but as signals that we could use to understand ourselves better? 

## Install dependencies

- Create a new anaconda environment
```conda create -n fusion```

After creating the enviroment, it is activated by default. To switch between conda environments, use this command ```conda activate environment-name``` where 'environment-name' can be `fusion` or `base`

When you open this project for the first time, run this command
```pip install -r requirements.txt```

## Getting you data
### For google calendar data
Follow the instructions in the [google-calendar folder](./google-calendar/README.md)

### For spotify data
Follow the instructions in the [spotify-data folder](./spotify-data/README.md)

### For github data
Follow the instructions in the [github-data folder](./github-data/README.md)

## Interacting with dashboard
Follow the instructions in the [dashboard folder](./dashboard/README.md)

## Todos

[x] Extract methods for different datasets into seperate python files / methods (utils.py)

[] dashboard
    [x] read data as .csv
    [x] static version with gantt chart
    [x] date filter to activity data
    [x] minimum duration filter to activity data
    [x] application usage summary to activity data
    [] oura / physio summaries
    [] oura summary - time spent moving around vs being stationary (usually represents sitting down, lying down)
    [] ...

# What's next
https://www.notion.so/next-steps-for-fusion-betting-on-magicFlow-56c74371306c4816a9e08722868a9163

First step:
- get data collection script going to call these "experiments"
    - first connect neurosity
    - show avg. sig quality
    - start recording 
    - save (
        per user,
        year/month/day folder format
    )
    - (fix eyes on cross ) - go checkout lab.js