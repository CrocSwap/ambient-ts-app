import { LiquidityParsedDataIF } from '../../api';
export interface LiquidityDataIF {
    currentTick: number;
    ranges: LiquidityParsedDataIF;
    curveState: {
        base: string;
        quote: string;
        poolIdx: number;
        chainId: string;
    };
}
