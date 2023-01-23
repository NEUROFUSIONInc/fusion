# Neurofusion Client
Client is run using React & deployed to vercel

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

## Authentication
- Auth is done using [Magic](https://magic.link)
    - user enters email & get sign in link
    - once verified, the page loads
    - TODO: api request is made to the backend to create/store latest use timestamp
    - authenticated routes check for if the user is signed in, if not redirect to /login