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

<b>Note</b>: In this guide we describe using yarn to install packages. Other package managers may be used at your discretion. With yarn, you have several options available for managing how your OS command line resolves the location of package. but we prefer to use yarn to avoid any problems.

Install project dependencies

```bash
$ cd root-project
$ yarn install
```

Build monorepo package

```bash
$ cd root-project
$ yarn build
```

Use Node v16

```
nvm use 16
```

## Using

Once installed, you can start user-interface in local environment with following commands:

```bash
$ cd root-project/packages/staking-ui
$ yarn start:[jfin, jfintest]
```

For deploy to production you need to build static at user-interface directory, and then copy `build` directory to your web server, to build static run the following commands:

```bash
$ cd root-project/packages/staking-ui
$ yarn build:[jfin, jfintest]
```

To deploy user interface to <b>preview</b> envrioment include mainnet, testnet by run the following commands:

```bash
$ cd root-project/packages/staking-ui
$ yarn deploy-preview:[mainnet, testnet]
```

## Project structure

This project consists of three parts. that are connected to each other, the main ones that we need to consider are `staking-ui` and `javascript-sdk`

```
    .
    ├── packages
    │   ├── backoffice-ui           # Backoffice user-interface
    │   ├── javascript-sdk          # Web3 sdk library (need to build every time after changed)
    │   └── staking-ui              # Staking user-interface
    │       └── src
    │           ├── assets          # assets file include images, css
    │           ├── components      # each component that using on page is stored here
    │           ├── pages           # user-interface pages
    │           ├── stores          # mobx storage include web3 config, functional and modal
    │           └── utils           # helper and const
    └── ...
```

\*\*\* Please check before using some page and components. It's an old file that is no longer in use. but is also exist for future error references (from original fork).

## Others

`javascript-sdk` It needs to be rebuilt after every edit.

```bash
$ cd root-project
$ yarn build
```

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
