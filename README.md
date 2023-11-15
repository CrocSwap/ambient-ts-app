<a id='top'></a>

# Introduction
Welcome to the Ambient Finance platform! Please [click here](https://ambient.finance/) to launch the web app.

# Table of Contents

1. [Instructions for Use](#instructions-for-use)
2. [Contributions](#contributions)
3. [Version Notes](#version-notes)
4. [Contact](#contact)

# Instructions for Use

### Dev Mode

Clone the repo and use `yarn start` to run the Ambient UI in development mode.

Open [http://localhost:3000](http://localhost:3000) to view it in a browser.

Note: Node v16+ is required

### Environmental Variables

Configure your build environment by adding a dotfile (e.g. `.env.local`) with variable definitions to the top level directory before starting the server. Please reference `.gitignore` in the root directory for dotfile naming conventions.

#### Chain IDs

This allows the app to interface with different networks as defined in the SDK (not all deployments support all networks).

Format: `REACT_APP_CHAIN_IDS=0x1,0x82750,0x5`

Notes:
  * `0x1` → Ethereum Mainnet
  * `0x82750` → Scroll (Ethereum L2 ZK Rollup)
  * `0x5` → Görli Testnet

#### Infura

This is a key for the Infura API which is used to pull metadata from on-chain.

Format: `REACT_APP_INFURA_KEY=*********************`

Notes:
  * Please use your own Infura key for development purposes.

[Back to Top](#top)

# Contributions

Contributions are always welcome! Feel free to open a GitHub Issue or Pull Request.

Please see the docs for our coding style guide: https://github.com/CrocSwap/ambient-ts-app/tree/develop/docs

[Back to Top](#top)

# Version Notes
Release notes for app versions.

Quick Links: [1.6](#version-16) (Current) | [1.5](#version-15)

### version 1.6
Summary:
* Added the ability to switch to the Scroll network and a test network (Görli) using the network selector in the page header
* Added an external link to [Canto](https://beta.canto.io/lp) in the network selector
* Updated the pool initialization form to enable additionally minting an initial liquidity position
* Fixed a bug preventing approvals of certain tokens (thanks [busimus](https://github.com/busimus)!)
* Added the ability to annotate the price charts with trend lines and horizontal rays
* Added USD $ value estimation calculations to the token selectors in the swap/limit/pool modules based on CoinGecko

Code changes are viewable on GitHub [Link](https://github.com/CrocSwap/ambient-ts-app/pull/3225)

### version 1.5
Summary:
* Refactored styling for easier future updates to add customizability.

Code changes are viewable on GitHub [Link](https://github.com/CrocSwap/ambient-ts-app/pull/3039)

[Back to Top](#top)

# Contact

### Social Media

* [Twitter](https://twitter.com/ambient_finance "Ambient Finance on Twitter")
* [Discord](https://discord.com/invite/ambient-finance "Ambient Finance on Discord")
* [Medium](https://crocswap.medium.com/ "Crocodile Labs on Medium")
* [Corporate Site](https://www.crocswap.com/ "About Crocodile Labs")

### People

* [Doug Colkitt](mailto:doug@crocodilelabs.io "email Doug") is the Founder & CEO of Crocodile Labs
* [Vee](mailto:vee@crocodilelabs.io "email Vee") is our Community Manager and handles external communications
* [Emily](mailto:emily@crocodilelabs.io "email Emily") is the primary caretaker of this document

[Back to Top](#top)