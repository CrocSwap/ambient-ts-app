export const getMoneynessRank = (addressWithChain: string): number => {
    /* 
        This 'moneyness' rank is intended to reflect an average user's expectation 
        of default price denomination, e.g. the price of the ETH/USDC pool should be 
        denominated by default in USDC for an appearance like 1,600, rather than 0.0006. 
        
        Comparing the moneyness rank value of USDC with the rank of ETH allows the front-end
        to set the default denomination to USDC, as it has a higher moneyness rank.

        The user can override this default denomination on /trade, but not /account.

        The current hardcoded ranking values are ordered according the dev team's intuition, 
        but otherwise arbitrary.
    */

    const goerliUSDC = '0xd87ba7a50b2e7e660f678a895e4b72e7cb4ccd9c_0x5';
    const goerliDAI = '0xdc31ee1784292379fbb2964b3b9c4124d8f89c60_0x5';
    const goerliWBTC = '0xc04b0d3107736c32e19f1c62b2af67be61d63a05_0x5';
    const goerliETH = '0x0000000000000000000000000000000000000000_0x5';
    const arbGoerliETH = '0x0000000000000000000000000000000000000000_0x66eed';
    const arbGoerliUSDC = '0xc944b73fba33a773a4a07340333a3184a70af1ae_0x66eed';

    const usdcMoneynessRank = 100;
    const daiMoneynessRank = 90;
    const wbtcMoneynessRank = 60;
    const ethMoneynessRank = 50;

    const moneynessMap = new Map<string, number>([
        [goerliUSDC, usdcMoneynessRank],
        [arbGoerliUSDC, usdcMoneynessRank],
        [goerliDAI, daiMoneynessRank],
        [goerliWBTC, wbtcMoneynessRank],
        [goerliETH, ethMoneynessRank],
        [arbGoerliETH, ethMoneynessRank],
    ]);

    const rank = moneynessMap.get(addressWithChain.toLowerCase()) || 0;
    return rank;
};
