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

```

### Example

By default, everything is exported from the root directory (all constants, functions, types, etc.)

#### Constants
```
import { blacklist } from '@crocswap-libs/ambient-utils';

...

if (blacklist.contains(user.address)) disconnect();
```

#### Functions
```
// fetch ens addresses
import { fetchBatch } from '@crocswap-libs/ambient-utils';

...

const ensAddress = fetchBatch<'ens_address'>({config_path: 'ens_address', address: user.address});
```

#### Type Definitions

```
import { TokenIF } from '@crocswap-libs/ambient-utils';

...

const myToken: TokenIF = { ... };
```

## Support

To submit any bugs, questions or request features, please see https://github.com/CrocSwap/ambient-ts-app