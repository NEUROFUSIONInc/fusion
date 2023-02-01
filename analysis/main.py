import flask
import json


# start flask server
app = flask.Flask(__name__)


# accept timestamp & fetch data from store to process

@app.route('/process', methods=['POST'])
def process():
    # get timestamp from request
    timestamp = flask.request.form['timestamp']
    datatype = flask.request.form['datatype']

    # for example, if we 
    # fetch data from store
    data = fetch_data(timestamp)
    # process data
    processed_data = process_data(data)
    # return processed data
    return processed_data

def processEvents(datatype: str, data: dict):
    # process data
    
    return processed_data

def processEEGPowerSpectrum(datatype: str, data: dict):
    # process data
    
    return processed_data
# processed data in this case is
# a json object with the following structure
# {
#   "timestamp": "2019-01-01 00:00:00",
#   "data_type":
#   "data": {
#       "key1": "value1",


# tbh, i don't think I'm here yet... I think eeg data for a day summary needs to be clearer

# the goal will be then saying that your brain power average for today is

# dataset where magicflow events and eeg recordings overlap