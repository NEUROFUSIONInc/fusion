## Getting started

- Create your app on [spotify dev portal](https://developer.spotify.com/dashboard/)

- Add "http://localhost:7777/callback" as a redirect uri on the spotify dev portal 
![](./add-redirect-uri.jpg)

**Be sure that you are running these when you're in the `spotify-data` directory**

- Create an empty `.env` file in the `/spotify-data` folder. It should be identical to `.env.example`
```
cp .env.example .env
```

- Update  `USERNAME` (e.g orogundipe), `CLIENT_ID` and `CLIENT_SECRET` (fetched from the dev portal) in `.env` with your details

- Run `python getspotifydata.py`. 
    - you should see a `.csv` file created in the `spotify-data` folder