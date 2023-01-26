# Fusion
What do we find when we stop treating our usage data across apps as a by-product but as signals that we could use to understand ourselves better? 

[Neurofusion](https://usefusion.app) allows you to record brain activity and correlate with other signals like behaviour (ie. productivity) and health data. 

## core data integrations
----------------------
brain activity (neurosity)
productivity / actions on device - (magicflow, activitywatch)
health (tryvital - oura, fitbit, glucose monitor etc)

## Data Storage
Folder structure for uploaded data in Blob storage is in this format

<userid>/YYYY/MM/DD/<data-type>/<data-type_unixtimestamp.json>

## Schemas
### Events
Events are used to tag recordings. You can have multiple events within a time range
- event must have 'startTimestamp' & 'event' obj
- if 'endTimestamp' is ommited, it is assumed you're just logging point in time (single action e.g drink coffee)
- 'eventValue' will be very useful for self sampling
```json
{
    "startTimestamp": ,
    "endTimestamp": ,
    "event":
    {
        "name",
        "description",
        "value"
    }
}
```

## Visualizations
Goal build the best intuitive visualization
- allow to see visualization side by side

## Architecture
![](./architecture.png)

### Getting started
- Clone the repo

### Frontend Client
See [set up details in neurofusion/client folder](./neurofusion/client/README.md)

### Backend Server
See [set up details in neurofusion/server folder](./neurofusion/server/README.md)

### Analysis
See [/analysis folder](./analysis/README.md)

### Other Services
Blob Storage - Azure
Authentication - Magic Link
Brain Data  - Neurosity

## References
Project Overview & Lab Notes - https://www.notion.so/next-steps-for-fusion-betting-on-magicFlow-56c74371306c4816a9e08722868a9163

Project Monthly Updates - https://neurofusion.substack.com

Pending Tasks - https://github.com/users/oreHGA/projects/1