# Fusion Explorer (Web) Client

Code for what powers https://usefusion.app

## Running Locally

- Install dependencies

```
npm install
```

- Use the npm command

```
npm run dev
```

## How we do anonymous auth

- Auth is done using [Nostr](https://nostr.com)

- Client & Fusion server are connected to Fusion's relay endpoint ws://relay.usefusion.ai
- Client makes a request to Fusion server with it's public key
- Fusion server
  - receives request,
  - creates/validates account,
  - sends signs a nip04 encrpyted message containing authToken, with Client as receiver
  - drops message on Fusion relay
- Client listens for message, decrypts message using nip04 (If the client has nos2x extension, we use window.nostr!)
- Client stores authToken and uses it for future api requests to server

See [auth.service.ts](src/services/auth.service.ts) for implementation details

## (For maintainers only) To update the certs used for localhost to run https

NOTE: You don't need to do this if you're just getting the repo set up. There's already one created in the `/certs`

- Change directory to `/certs`

- Install the mkcert utility by running
  `brew install mkcert` (if you're using macOS) or
  by downloading the appropriate package for your system from the mkcert Github repository: https://github.com/FiloSottile/mkcert

- Once mkcert is installed, run the following commands in the `next-client` path to create a local certificate authority and generate a certificate for localhost:

```
mkcert -install
mkcert localhost
```

- The `mkcert localhost` command will create two `*.pem` files

The `server.js` looks for the certs when setting up the https proxy
