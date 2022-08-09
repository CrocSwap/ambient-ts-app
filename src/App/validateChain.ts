// TODO:  DO NOT DELETE commented out code!  I'm leaving this here for a
// TODO:  ... future refactor of this feature ( --Emily )

// these are all the chains supported by Moralis and their lookup values
// const chainIds = {
//     ethereum: ['eth', 'mainnet', '0x1'],
//     ropsten: ['testnet', 'ropsten', '0x3'],
//     rinkeby: ['rinkeby', '0x4'],
//     goerli: ['goerly', '0x5'],
//     binance: ['bsc', 'binance', 'binance smart chain', '0x38'],
//     polygon: ['matic', 'polygon', '0x89'],
//     mumbai: ['mumbai', 'matic testnet', 'polygon testnet', '0x13881'],
//     avalanche: ['avalanche', '0xa86a'],
//     fuji: ['avalanche testnet', '0xa869'],
//     fantom: ['fantom', '0xfa'],
// };

// list all chains here that our app supports
const supportedChainsTemp = ['0x5'];

export const validateChain = (currentChain: string) => {
    const output: boolean = supportedChainsTemp.includes(currentChain);
    return output;
};

// TODO:  Future implementation is as follows:
// TODO:      1. Make an array of all supported chains corresponding to keys
// TODO:         ... in the `chainIds` object
// TODO:      2. Map over the `supportedChains` array and return the value
// TODO:         ... of each key-value pair
// TODO:      3. Flatten the array created in the previous step (it should
// TODO:         ... be an array of arrays
// TODO:      4. Use `.includes()` to check if the chain that function
// TODO:         ... `validatedChain()` was called on exists as a lookup value
// TODO:      5. Have function `validateChain()` return the bool received from
// TODO:         ... `.includes()`
