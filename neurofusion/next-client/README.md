# Next.js + Tailwind CSS Example

This example shows how to use [Tailwind CSS](https://tailwindcss.com/) [(v3.2)](https://tailwindcss.com/blog/tailwindcss-v3-2) with Next.js. It follows the steps outlined in the official [Tailwind docs](https://tailwindcss.com/docs/guides/nextjs).

## Deploy your own

Deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=next-example) or preview live with [StackBlitz](https://stackblitz.com/github/vercel/next.js/tree/canary/examples/with-tailwindcss)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/vercel/next.js/tree/canary/examples/with-tailwindcss&project-name=with-tailwindcss&repository-name=with-tailwindcss)

## How to use

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init), [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/), or [pnpm](https://pnpm.io) to bootstrap the example:

```bash
npx create-next-app --example with-tailwindcss with-tailwindcss-app
```

```bash
yarn create next-app --example with-tailwindcss with-tailwindcss-app
```

```bash
pnpm create next-app --example with-tailwindcss with-tailwindcss-app
```

Deploy it to the cloud with [Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).

{Adding extra changes...}

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

- To run the following commands in different terminals

  - Start your Next.JS server (First Step)

  ```
  npm run dev
  ```

  - Run the proxy to target port 3000,

  ```
  local-ssl-proxy --source 3000 --target 3001 --cert localhost.pem --key localhost-key.pem
  ```

- Start the local server using

```
node server.js
```
