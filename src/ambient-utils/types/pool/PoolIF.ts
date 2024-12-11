import { TokenIF } from '../token/TokenIF';

export interface PoolIF {
    name?: string;
    base: TokenIF;
    quote: TokenIF;
    chainId: string;
    poolIdx: number;
    isBaseTokenMoneynessGreaterOrEqual?: boolean;
}

export interface PoolDataIF extends PoolIF {
    spotPrice: number;
    displayPrice: string;
    poolIdx: number;
    tvl: number;
    tvlStr: string;
    volume: number;
    volumeStr: string;
    apr: number;
    priceChange: number;
    priceChangeStr: string;
    moneyness: {
        base: number;
        quote: number;
    };
    usdPriceMoneynessBased: number;
}
