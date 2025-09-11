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

Clone the repo and use `pnpm ambi` to run the Ambient UI in development mode.

Open [http://localhost:3000](http://localhost:3000) to view it in a browser.

Note: Node v18+ is required

### Environmental Variables

Configure your build environment by adding a dotfile (e.g. `.env.local`) with variable definitions to the top level directory before starting the server. Please reference `.gitignore` in the root directory for dotfile naming conventions.

# Contributions

Contributions are always welcome! Feel free to open a GitHub Issue or Pull Request.

Please see the docs for our coding style guide: https://github.com/CrocSwap/ambient-ts-app/tree/develop/docs

[Back to Top](#top)

# Version Notes

Release notes for app versions.

Quick Links: [1.7](#version-17) (Current) | [1.6](#version-16) | [1.5](#version-15)

### version 1.7

Summary:

- Added automatic gas cost estimate updates and estimate displays in the trade modules on Scroll
- Fixed value calculations for non-default (ETH/USDC) tokens
- Fixed display of ENS name resolutions in trade tables
- Fixed missing chart in transaction details on mobile devices

Code changes are viewable on GitHub [Link](https://github.com/CrocSwap/ambient-ts-app/pull/3269)

### version 1.6

Summary:

- Added the ability to switch to the Scroll network and a test network (Görli) using the network selector in the page header
- Added an external link to [Canto](https://www.canto.io/lp) in the network selector
- Updated the pool initialization form to enable additionally minting of an initial liquidity position
- Fixed a bug preventing approvals of certain tokens (thanks [busimus](https://github.com/busimus)!)
- Added the ability to annotate the price charts with trend lines and horizontal rays
- Added USD $ value estimation calculations to the token selectors in the swap/limit/pool modules based on CoinGecko

Code changes are viewable on GitHub [Link](https://github.com/CrocSwap/ambient-ts-app/pull/3225)

### version 1.5

Summary:

- Refactored styling for easier future updates to add customizability.

Code changes are viewable on GitHub [Link](https://github.com/CrocSwap/ambient-ts-app/pull/3039)

[Back to Top](#top)

# Contact

### Social Media

- [Twitter](https://x.com/ambient_finance 'Ambient Finance on Twitter')
- [Discord](https://discord.com/invite/ambient-finance 'Ambient Finance on Discord')
- [Medium](https://crocswap.medium.com/ 'Crocodile Labs on Medium')

### People

- [Doug Colkitt](mailto:doug@crocodilelabs.io 'email Doug') is the Founder & CEO of Crocodile Labs
- [Ben Wolski](mailto:ben@crocodilelabs.io 'email Ben') manages the CI/CD pipeline and production releases
- [Vee](mailto:vee@crocodilelabs.io 'email Vee') is our Community Manager and handles external communications
- [Emily](mailto:emily@crocodilelabs.io 'email Emily') is the primary caretaker of this document

[Back to Top](#top)
