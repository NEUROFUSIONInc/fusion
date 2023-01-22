## Neurofusion Backend Server
Server is run using Node.js (express/CommonJS)

- Install node modules
```
yarn install
```

- Set environment variables
```
cp .env.example .env
```

Fetch env values [from note](https://www.icloud.com/notes/081Ci0RTYFZk2smnqXttFoceg#Neurofusion_Cred)

- Start the server
```
yarn start
```

# Server functionality
- User Login - return UserGuid return to client
- Neurosity OAuth - for managing neurosity device connection
- Upload and Fetch data from blob storage
- Make request to the analytics server after a new data point is fetched