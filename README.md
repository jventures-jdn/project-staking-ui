<!-- ------------------------------- Header -------------------------------- -->
<p align="center">
  <a href="https://jfinchain.com/" target="blank"><img src="https://jfinchain.com/imgs/JFINChain-logo.svg" height="100" alt="JFINCHAIN Logo" /></a>
</p>
<p align="center">JFIN CHAIN BEYOND THE FUTURE.</p>

<p align="center">
    <a href="https://www.facebook.com/JFINofficial" target="_blank">
        <img src="https://img.shields.io/badge/Facebook-1877F2?style=social&logo=facebook">
    </a>
    <a href="https://twitter.com/jfinofficial" target="_blank">
        <img src="https://img.shields.io/github/followers/jventures-jdn?style=social">
    </a>
</p>
<hr/>

<p align="center">
    Official <a href="https://github.com/jventures-jdn/project-staking-ui">Staking Repository</a> for user-interface website
</p>

## Installation

<b>Note</b>: In this guide we describe using pnpm to install packages.

First, you need to install package manager call pnpm, this package is absolutely necessary to manage monorepo project

```bash
$ npm install -g pnpm
```

Second, Install project dependencies to all repo

```bash
$ pnpm i
```

## Using

Once installed everything above, you can start website in local environment with following commands:

```bash
$ cd ./apps/staking-ui
$ pnpm dev:jfin # for mainnet
$ pnpm dev:jfintest # for testnet
```

## Deploy

To deploy to firebase, run the following commands:

```bash
$ cd ./apps/staking-ui
$ pnpm deploy-preview:mainnet # for mainnet
$ pnpm deploy-preview:testnet # for testnet
$ pnpm deploy-preview # both
```

If you want to deploy to custom hosting you need to build static then copy `dist` directory to your hosting, to build static run the following commands:

```bash
$ cd ./apps/staking-ui
$ pnpm build:jfin # for mainnet
$ pnpm build:jfintest # for testnet
```

## Project structure

This project consists of three parts. that are connected to each other, the main ones that we need to consider are `staking-ui` and `javascript-sdk`

```
    .
    ├── apps
    │   ├── javascript-sdk          # "Old" web3 sdk library (no longer used)
    │   └── staking-ui              # Staking user-interface
    │       └── src
    │           ├── assets          # assets file include images, css
    │           ├── components      # each component that using on page is stored here
    │           ├── pages           # user-interface pages
    │           ├── stores          # mobx storage include web3 config, functional and modal
    │           └── utils           # helper and const
    ├── utils
    │   └── chain                   # "New" web3 sdk for handle all things in smart contract
    └──...
```

## Others

When new validator has been added to the chain you need to match address with the validator's name and image at `staking-ui/.../utils/const.ts`

```javascript
export const VALIDATOR_WALLETS: Record<string, {name: string, image: string}> = {
    "address": {
        name: "validator name",
        image: validator import image
    },
}
```

If you want to change `gas prices` or `gas limit` You can change it at `javascript-sdk/.../config.ts`

```javascript
export const GAS_LIMIT_CLAIM = (mainnet = "25000000"),
  testnet = "7000000";
export const GAS_LIMIT_GOVERNANCE = (mainnet = "15000000"),
  testnet = "7000000";
export const GAS_PRICE = "23000000000";
```

## Team

- [JVenture Team](https://github.com/orgs/jventures-jdn)

## Contact Us

For business inquiries: info@jventures.co.th
