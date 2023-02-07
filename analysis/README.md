## Getting Started
- Create a new anaconda environment
```conda create -n fusion```

After creating the enviroment, it is activated by default. To switch between conda environments, use this command ```conda activate environment-name``` where 'environment-name' can be `fusion` or `base`

When you open this project for the first time, run this command
```pip install -r requirements.txt```

The processing functions will be triggered via an HTTP request to hosted azure function endpoint.

 - main.py contains the core processing functions.
 - {Wip} Azure function set up
  - See function.json for endpoints


### Queries from derived datasets
A lot of the [notebooks](./notebooks/) will be changed to processing functions run at intervals:

 - screen time processing (magicflow & activitywatch) watch processing - for getting interests, context switches
 - brain activity over time - showing power by band when signal quality is good
 - correlations - doing pearsons & spearmans correlation + predictive power score on a joined dataset for time period
   - should actually compare "say 3months" ago to now

Outputs
-------
- brain power average for today is

- dataset where events and eeg recordings overlap
