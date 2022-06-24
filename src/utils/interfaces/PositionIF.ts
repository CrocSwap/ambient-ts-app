// import { PositionPoolIF } from './PositionPoolIF';
export interface PositionIF {
    ambient: boolean;
    askTick: number;
    baseTokenSymbol: string;
    bidTick: number;
    highRangeDisplay: string;
    id: string;
    lowRangeDisplay: string;
    pool: {
        base: string;
        id: string;
        poolIdx: string;
        quote: string;
    };
    quoteTokenSymbol: string;
    tokenAQtyDisplay: string;
    tokenBQtyDisplay: string;
}
