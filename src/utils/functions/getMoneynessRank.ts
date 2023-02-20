export const getMoneynessRank = (addr: string): number => {
    const moneynessMap = new Map<string, number>([
        [
            '0xd87ba7a50b2e7e660f678a895e4b72e7cb4ccd9c_0x5', // 'USDC' on Goerli
            100,
        ],
        [
            '0xdc31ee1784292379fbb2964b3b9c4124d8f89c60_0x5', // 'DAI' on Goerli
            90,
        ],
        [
            '0xc04b0d3107736c32e19f1c62b2af67be61d63a05_0x5', // 'WBTC' on Goerli
            60,
        ],
        [
            '0x0000000000000000000000000000000000000000_0x5', // 'ETH' on Goerli
            50,
        ],
    ]);

    const rank = moneynessMap.get(addr.toLowerCase()) || 0;
    return rank;
};
