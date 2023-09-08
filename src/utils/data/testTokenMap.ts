export const testTokenMap = new Map([
    [
        '0x0000000000000000000000000000000000000000_0x1', // 'ETH' on Mainnet
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2_0x1', // 'WETH' on Mainnet
    ],
    [
        '0x0000000000000000000000000000000000000000_0x5', // 'ETH' on Goerli
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2_0x1', // 'WETH' on Mainnet
    ],
    [
        '0xdc31ee1784292379fbb2964b3b9c4124d8f89c60_0x5', // 'DAI' on Goerli
        '0x6b175474e89094c44da98b954eedeac495271d0f_0x1', // 'DAI' on Mainnet
    ],
    [
        '0xd87ba7a50b2e7e660f678a895e4b72e7cb4ccd9c_0x5', // 'USDC' on Goerli
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48_0x1', // 'USDC' on Mainnet
    ],
    [
        '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984_0x5', // 'UNI' on Goerli
        '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984_0x1', // 'UNI' on Mainnet
    ],
    [
        '0x0595328847af962f951a4f8f8ee9a3bf261e4f6b_0x5', // 'OHM' on Goerli
        '0x64aa3364f17a4d01c6f1751fd97c2bd3d7e7f1d5_0x1', // 'OHM' on Mainnet
    ],
    [
        '0x4e3d1e75c459f8c3306033f78b257ab51c2dab6c_0x5', // 'WTT1021' on Goerli
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48_0x1', // 'USDC' on Mainnet
    ],
    [
        '0xaba2085b2bd788c505e10bd6dc69b8a2bd380fa3_0x5', // 'USDC' by Ben on Goerli
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48_0x1', // 'USDC' on Mainnet
    ],
    [
        '0xc04b0d3107736c32e19f1c62b2af67be61d63a05_0x5', // 'WBTC' on Goerli
        '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599_0x1', // 'WBTC' on Mainnet
    ],
    [
        '0x630f8b9d8f517af8f5b8670e6a167b6c0240d583_0x5', // 'PEPE' by Ben on Goerli
        '0x6982508145454ce325ddbe47a25d4ec3d2311933_0x1', // 'PEPE' on Mainnet
    ],
    [
        '0x0000000000000000000000000000000000000000_0x66eed', // ETH on Arb Goerli
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2_0x1', // 'WETH' on Mainnet
    ],
    [
        '0xc944b73fba33a773a4a07340333a3184a70af1ae_0x66eed', // USDC on Arg Goerli
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48_0x1', // 'USDC' on Mainnet
    ],
]);

export function getMainnetEquivalent(
    token: string,
    chainId: string,
): { token: string; chainId: string } {
    const keyLookup = (token + '_' + chainId).toLowerCase();
    const lookup = testTokenMap.get(keyLookup);
    if (lookup) {
        return {
            token: lookup.split('_')[0],
            chainId: lookup.split('_')[1],
        };
    } else if (chainId === '0x1') {
        return {
            token: token,
            chainId: chainId,
        };
    } else {
        return {
            token: '',
            chainId: chainId,
        };
    }
}

export function translateMainnetForGraphcache(
    baseToken: string,
    quoteToken: string,
): { baseToken: string; quoteToken: string } {
    const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
    const ZERO = '0x0000000000000000000000000000000000000000';
    if (baseToken === WETH) {
        return { baseToken: ZERO, quoteToken: quoteToken };
    } else if (quoteToken === WETH) {
        return { baseToken: ZERO, quoteToken: baseToken };
    } else {
        return { baseToken: baseToken, quoteToken: quoteToken };
    }
}
