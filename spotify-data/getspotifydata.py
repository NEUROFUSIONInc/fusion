import spotipy.util as util
import requests
import datetime
from datetime import date
import pandas as pd

username = 'YOUR_USERNAME'
client_id ='YOUR_CLIENT_ID'
client_secret = 'YOUR_CLIENT_SECRET'
redirect_uri = 'http://localhost:7777/callback'
scope = 'user-read-recently-played'

token = util.prompt_for_user_token(username=username, 
                                   scope=scope, 
                                   client_id=client_id,   
                                   client_secret=client_secret,     
                                   redirect_uri=redirect_uri)

def get_listening_history():
    headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': f'Bearer ' + token,
    }

    now = datetime.datetime.utcnow()
    beginning_time = now - datetime.timedelta(days=7)

    timestamp_steps = 6 * 60 * 60  # basically 6 hrs in seconds
    timestamp_entries = [x for x in range(int(beginning_time.timestamp()), int(now.timestamp()), timestamp_steps)]
    song_history = []

    for i in range(len(timestamp_entries)):
        # make request to listening history in period
        params = [
            ('limit', 50),
            ('before', timestamp_entries[i] * 1000) # orginally timestamps are in seconds, need to conver to milliseconds for spotify api
        ]

        try:
            response = requests.get('https://api.spotify.com/v1/me/player/recently-played',
                            headers = headers, params = params)
            json = response.json()
            
            for single_item in json['items']:
                # todo: add the context in which song was played
                artists = "" # this will be a | seperated list of artists for song
                for artist in single_item['track']['artists']:
                    artists += artist["name"] + "|"
                artists = artists[:-1]

                entry = {
                    'timestamp': single_item['played_at'],
                    'name': single_item['track']['name'],
                    'artists': artists,
                    'uri': single_item['track']['uri'],
                    'duration_ms': single_item['track']['duration_ms'],
                    'explicit': single_item['track']['explicit'],
                }
                song_history.append( entry )
        except:
            print("error")
            continue
    
    return song_history

def write_events_to_csv(song_history):
    event_df = pd.DataFrame([song for song in song_history])
    filename = "data.csv"
    filepath = filename
    print("Creating CSV at " + filepath)
    event_df.to_csv(filepath, index=False)

history = get_listening_history()
write_events_to_csv(history)