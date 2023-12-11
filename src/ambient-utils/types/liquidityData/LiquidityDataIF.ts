import { LiquidityRangeIF } from './LiquidityRangeIF';

export interface LiquidityDataIF {
    currentTick: number;
    ranges: Array<LiquidityRangeIF>;
    curveState: {
        base: string;
        quote: string;
        poolIdx: number;
        chainId: string;
    };
}
