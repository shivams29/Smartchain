# Smartchain

Ethereum like blockchain framework (currently in development) also providing functionality for running smart contracts.

## Project Setup

#### Install Node JS

Node JS must be installed. For installation head to this [link](https://nodejs.org/en/download/) and install node version **v20.10.0**.

#### Install dependencies

Open command prompt in the root directory and run the following command to install the project.

```
npm install
```

#### Environment Setup

This project uses PubNub for networking between different nodes. Follow the steps to set up the network:

1. Create a free account on [PubNub](https://admin.pubnub.com/#/login).
2. Create an app and copy the publish key and subscribe key for later use.
3. Create a .env file in the root directory and paste the contents from .env.template.
4. Add the subscribe and publish keys.
5. Add base url. Use `http://localhost` for local env.
6. Add Root Node PORT. Use `3000` for local env.

#### Run Project

Use the following commands for running the project.

For running the main server use command:

```
npm run dev
```

For running peer nodes, use command:

```
npm run dev-peer
```

## Running Tests

Open command prompt in the root directory and run the following command:

```
npm run test
```
