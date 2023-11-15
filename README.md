<a id='top'></a>

# Introduction
Welcome to the Ambient Finance platform! Please [click here](https://ambient.finance/) to launch the web app.

# Table of Contents

1. [Instructions for Use](#instructions)
2. [Contributions](#contributions)

[Back to Top](#top)
<a id='instructions'></a>

# Instructions for Use

### Dev Mode

Clone the repo and use `yarn start` to run the Ambient UI in development mode.

Open [http://localhost:3000](http://localhost:3000) to view it in a browser.

Note: Node v16+ is required

### Environmental Variables

Configure your build environment by adding a dotfile (e.g. `.env.local`) with variable definitions to the top level directory before starting the server. Please reference `.gitignore` in the root directory for dotfile naming conventions.

* Chain IDs
This allows the app to interface with different networks as defined in the SDK (not all deployments support all networks).
Format: `REACT_APP_CHAIN_IDS=0x1,0x82750,0x5`
Notes:
  * `0x1` → Ethereum Mainnet
  * `0x82750` → Scroll (Ethereum L2 ZK Rollup)
  * `0x5` → Görli Testnet

* Infura
This is a key for the Infura API which is used to pull metadata from on-chain.
Format: `REACT_APP_INFURA_KEY=*********************`
Notes:
  * Please use your own Infura key for development purposes.

[Back to Top](#top)
<a id='instructions'></a>

# Contributions

Contributions are always welcome! Feel free to open a GitHub Issue or Pull Request.

Please see the docs for our coding style guide: https://github.com/CrocSwap/ambient-ts-app/tree/develop/docs
