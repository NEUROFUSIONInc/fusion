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
- User Login - return userMetadata to client
- Neurosity OAuth - for managing neurosity device connection
- Upload and Fetch data from blob storage
- Make request to the analytics server after a new data point is fetched


## Database
We use sequelize migrations. On a new db run
```
yarn sequelize-cli db:migrate
```

For more details, see [docs on sequelize migrations](https://sequelize.org/docs/v6/other-topics/migrations/) 

Notes
- Need to validate that an expired token can't be used to fool ./controllers/user.js