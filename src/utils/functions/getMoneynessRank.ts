import { Tokens } from '../interfaces/NetworkIF';

export const getMoneynessRank = (tokenSymbol: string): number => {
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

    const moneynessRank: { [K in keyof Tokens]: number } = {
        USDC: 100,
        DAI: 90,
        USDT: 80,
        FRAX: 70,
        WBTC: 60,
        ETH: 50,
        UNI: 0,
        WETH: 0,
        PEPE: 0,
    };

    const rank = moneynessRank[tokenSymbol as keyof Tokens] ?? 0;
    return rank;
};
