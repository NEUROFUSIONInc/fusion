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

- JWT Authentication - a user can only interact with their own data
- User Login - return fusion token
- Upload and Fetch data from azure blob storage
- Neurosity - for managing neurosity device connection
- Magicflow - get/set token and queue fetch to fusion storage
- Analytics
  - calls after related data points are fetched (can only perform action if token matches user account)
    - merge eegPowerSpectrum with signal quality

## Database

We use sequelize migrations. On a new db run

```
yarn sequelize-cli db:migrate
```

For more details, see [docs on sequelize migrations](https://sequelize.org/docs/v6/other-topics/migrations/)

Notes

- Need to validate that an expired token can't be used to fool magiclink auth ./controllers/user.js

## Data Fetch Scheduling

- Magicflow, fetch nightly defined in [./cron-jobs/magicflow-daily-fetch.js](./cron-jobs/magicflow-daily-fetch.js) invoked in [./index.js](./index.js)
