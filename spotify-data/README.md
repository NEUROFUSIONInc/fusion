## Getting started

- Create your app on spotify dev portal

- Add "http://localhost:7777/callback" as a redirect uri on the spotify dev portal 
![](./add-redirect-uri.jpg)

- Update  `username` (e.g orogundipe), `client_id` and `client_secret` (fetched from the dev portal) in `getspotifydata.py` with your details

**Be sure that you are running this when you're in the `spotify-data` directory**
- Run `python getspotifydata.py`. 