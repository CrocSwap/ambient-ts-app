// import sum from 'hash-sum';

import { LimitOrderIF } from '../interfaces/LimitOrderIF';
import { PositionIF } from '../interfaces/PositionIF';
import { TransactionIF } from '../interfaces/TransactionIF';
import {
    CandleData,
    CandlesByPoolAndDuration,
    LiquidityData,
} from '../state/graphDataSlice';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function diffHashSig(x: any): string {
    if (!x) {
        return 'null';
    }
    if (x.length === 0) {
        return 'empty';
    }
    const result = JSON.stringify(x);
    return result;
}

// Optimized diff function for candle chart objects that avoid processing
// the giant candle array.
export function diffHashSigCandles(candles?: CandlesByPoolAndDuration) {
    if (!candles || !candles.candles) {
        return 'null';
    }
    if (candles.candles.length === 0) {
        return 'empty';
    }
    return diffHashSig({
        duration: candles.duration,
        pool: candles.pool,
        length: candles.candles.length,
        slice: candles.candles[0],
    });
}

export function diffHashSigChart(chartData?: CandleData[]) {
    if (!chartData) {
        return 'null';
    }
    if (chartData.length === 0) {
        return 'empty';
    }
    return diffHashSig({
        chartData,
    });
}

export function diffHashSigLiquidity(liquidity?: LiquidityData) {
    if (!liquidity) {
        return 'null';
    }
    if (liquidity.ranges.length == 0) {
        return 'empty';
    }

    return diffHashSig({
        time: liquidity.time,
        tick: liquidity.currentTick,
        curveState: liquidity.curveState,
        ranges: liquidity.ranges.map((r) => r.activeLiq),
    });
}

export function diffHashSigTxs(txs?: TransactionIF[]) {
    if (!txs) {
        return 'null';
    }
    return diffHashSig(txs.map((x) => x.txId));
}

export function diffHashSigLimits(txs?: LimitOrderIF[]) {
    if (!txs) {
        return 'null';
    }
    return diffHashSig(txs.map((x) => x.limitOrderId));
}

export function diffHashSigPostions(txs?: PositionIF[]) {
    if (!txs) {
        return 'null';
    }
    return diffHashSig(txs.map((x) => x.positionId));
}
