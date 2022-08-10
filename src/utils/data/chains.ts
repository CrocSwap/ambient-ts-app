// map of all chains supported by Moralis and recognized chain id values
// all chains supported by Moralis are here regardless of Ambient support
// keys === name of the network (human readable)
// values === chain ids Moralis will recognize
export const allMoralisChainIds = new Map()
    .set(
        'ethereum',
        ['eth', 'mainnet', '0x1']
    )
    .set(
        'goerli',
        ['goerli', '0x5']
    )
    .set(
        'binance mainnet',
        ['bsc', 'binance', 'binance smart chain', '0x38']
    )
    .set(
        'binance testnet',
        ['bsc testnet', 'binance testnet', 'binance smart chain testnet', '0x61']
    )
    .set(
        'polygon',
        ['matic', 'polygon', '0x89']
    )
    .set(
        'mumbai',
        ['mumbai', 'matic testnet', 'polygon testnet', '0x13881']
    )
    .set(
        'avalanche mainnet',
        ['avalanche', '0xa86a']
    )
    .set(
        'avalanche testnet',
        ['avalanche testnet', '0xa869']
    )
    .set(
        'fantom',
        ['fantom', '0xfa'])
    .set(
        'cronos',
        ['cronos', '0x19']
    );

// chains supported by the Ambient app
// this is the single source of truth for chains Ambient supports
// add or remove chains here to add or remove support in the app
export const ambientChains = [
    'goerli'
];

export function validateChainId() {
    const supportedChainIds = ambientChains.flatMap((chain: string) => allMoralisChainIds.get(chain));
    console.log({supportedChainIds});
}