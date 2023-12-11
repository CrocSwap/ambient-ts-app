import { CandleDataIF } from './CandleDataIF';

export interface CandlesByPoolAndDurationIF {
    pool: {
        baseAddress: string;
        quoteAddress: string;
        poolIdx: number;
        chainId: string;
    };
    duration: number;
    candles: Array<CandleDataIF>;
}
