// import { PositionPoolIF } from './PositionPoolIF';
export interface PositionIF {
    chainId: string;
    ambient: boolean;
    askTick: number;
    bidTick: number;
    id: string;
    isBid: boolean;
    knockout: boolean;
    poolIdx: number;
    base: string;
    baseTokenLogoURI: string;
    quoteTokenLogoURI: string;
    quote: string;
    user: string;
    userEnsName: string;
    baseTokenSymbol: string;
    quoteTokenSymbol: string;
    poolPriceInTicks: number;
    lowRangeDisplayInBase: string;
    highRangeDisplayInBase: string;
    lowRangeDisplayInQuote: string;
    highRangeDisplayInQuote: string;
    tokenAQtyDisplay: string;
    tokenBQtyDisplay: string;
    baseTokenDecimals: number;
    quoteTokenDecimals: number;
    positionType?: string;
}
