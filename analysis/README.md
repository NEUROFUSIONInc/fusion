## Getting Started
- Create a new anaconda environment
```conda create -n fusion```

After creating the enviroment, it is activated by default. To switch between conda environments, use this command ```conda activate environment-name``` where 'environment-name' can be `fusion` or `base`

When you open this project for the first time, run this command
```pip install -r requirements.txt```

A lot of the jupyter notebooks will be changed to server functions

- activity watch processing - for getting interests based on computer usage data
- brain activity over time - showing power by band when signal quality is good
- correlations - doing pearsons & spearmans correlation on a joined dataset for time period
    - should actually compare "say 3months" ago to now

Server will be run using flask