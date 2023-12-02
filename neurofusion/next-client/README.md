# Fusion Explorer (Web) Client

Code for what powers https://usefusion.app

## Getting your localhost to run https

- Install the mkcert utility by running
  `brew install mkcert` (if you're using macOS) or
  by downloading the appropriate package for your system from the mkcert Github repository: https://github.com/FiloSottile/mkcert

- Once mkcert is installed, run the following commands in the `next-client` path to create a local certificate authority and generate a certificate for localhost:

```
mkcert -install
mkcert localhost
```

- The `mkcert localhost` command will create two `*.pem` files that are automatically ignored by git

- Install the HTTPS proxy and run the proxy with the commands below:

```
npm install -g local-ssl-proxy
```

## Running the client

- Use the npm command

```
npm run dev
```

## How we do anonymous auth

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
