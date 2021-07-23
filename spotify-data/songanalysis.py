import spotipy, requests, json, time, re
from pprint import pprint
from spotipy.oauth2 import SpotifyClientCredentials
from collections import Counter

sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
        client_id="7c5ece12ee5f4c7989def9fde56d3c0c",
        client_secret="9a9cc837603b4b369907710e1fa9787e"
    ))

def get_song_details(spotify_song_id):
    return sp.track(spotify_song_id)

def get_song_analysis(spotify_song_id):
    return sp.audio_features(spotify_song_id)

def main():
    song_ids = [
        "spotify:track:19ehhyzTggrwMzaOzYt85g", "spotify:track:51mLQ3w7yR7vjdSTFLWaY5", "spotify:track:1JiR4RJaZlbZ5b3HG8jkeL",
        "spotify:track:1gAgb7hnZ9AAJ5MCcvSKqJ", "spotify:track:3QO1m6i0nsrp8aOnapvbkx", "spotify:track:2IwiLJ3VA4cZUWBcu18DAR",
        "spotify:track:6m4SEnC7eZLrgroEvwAmCF", "spotify:track:5C3vZiMOn2KHMbNQOhL6oQ", "spotify:track:4204hwPYuToiuSunPFUoML",
        "spotify:track:7BxWEstQxXtjczBE7ErYrE", "spotify:track:5FG7Tl93LdH117jEKYl3Cm", "spotify:track:1F7xMfEowsK6i0kODlO0Xl",
        "spotify:track:6ocTwwhYsATcgNkKZuw95O", "spotify:track:7CTTKdRhiXHDTWmgjnP68l"
    ]
    for song_id in song_ids:
        print("getting song details")
        spotify_details = get_song_details(song_id)
        song_title = spotify_details["name"]
        # wait()

        print("getting song analysis")
        analysis = get_song_analysis(song_id)
        # wait()

        song_details = {
            "spotify_uri": song_id,
            "title": song_title,
            "spotify_audio_features": analysis
        }
        try:
            print(json.dumps(song_details, indent=2), "\n\n_________________")
        except TypeError as error:
            print("!!! error printing string")

main()