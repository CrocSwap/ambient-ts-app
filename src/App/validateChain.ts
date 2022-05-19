// these are all the chains supported by Moralis and their lookup values
const chainIds = {
    ethereum: ['eth', 'mainnet', '0x1'],
    ropsten: ['testnet', 'ropsten', '0x3'],
    rinkeby: ['rinkeby', '0x4'],
    goerli: ['goerly', '0x5'],
    kovan: ['kovan', '0x2a'],
    binance: ['bsc', 'binance', 'binance smart chain', '0x38'],
    polygon: ['matic', 'polygon', '0x89'],
    mumbai: ['mumbai', 'matic testnet', 'polygon testnet', '0x13881'],
    avalanche: ['avalanche', '0xa86a'],
    fuji: ['avalanche testnet', '0xa869'],
    fantom: ['fantom', '0xfa'],
};



export const validateChain = () => {
    return true;
};
