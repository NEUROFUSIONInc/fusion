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

- Auth is done using [Nostr](https://nostr.com)

With Nostr
  - Client & Fusion server are connected to Fusion's relay endpoint ws://relay.usefusion.ai
  - Client makes a request to Fusion server with it's pubic key
  - Fusion server
      - receives request,
      - creates/validates account,
      - sends signs a nip04 encrpyted message containing authToken, with Client as receiver
      - drops message on Fusion relay
  - Client listens for message, decrypts message using nip04
  - Client stores authToken and uses it for future api requests to server

See auth.service.ts for implementation details
