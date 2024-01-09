# 🛠🐊🛠 The data layer/utilities of the Ambient Frontend.

## Links

### 1. https://github.com/CrocSwap/ambient-ts-app/tree/develop/src/ambient-utils

### 2. https://www.npmjs.com/package/@crocswap-libs/ambient-utils

## Usage

### Install
```
yarn install @crocswap-libs/ambient-utils
```
or

```
npm install @crocswap-libs/ambient-utils
```

### Configure

```
// App.tsx

import { initPackage } from '@crocswap-libs/ambient-utils';

function App() {
  useEffect(() => {
    initPackage({
      INFURA_API_KEY: 'your_infura_api_key',     // REQUIRED
      ETHERSCAN_API_KEY: 'your_etherscan_api_key',  // REQUIRED
    });
  }, []);
}
```

### Example

Once configured, by default, everything is exported from the root directory (all constants, functions, types, etc.)

#### Constants
```
// Wallet.tsx

import { blacklist } from '@crocswap-libs/ambient-utils';

...

if (blacklist.contains(user.address)) disconnect();
```

#### Functions
```
// Profile.tsx

import { fetchBatch } from '@crocswap-libs/ambient-utils';

...

const ensAddress = fetchBatch<'ens_address'>({config_path: 'ens_address', address: user.address});
```

#### Type Definitions

```
// TokenSelector.tsx

import { TokenIF } from '@crocswap-libs/ambient-utils';

...

const myToken: TokenIF = { ... };
```

## Support

To submit any bugs, questions or feature requests, please go to https://github.com/CrocSwap/ambient-ts-app
