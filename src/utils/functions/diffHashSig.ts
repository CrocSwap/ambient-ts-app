// import sum from 'hash-sum';

import { CandleData } from '../../App/functions/fetchCandleSeries';
import { LiquidityDataIF } from '../../App/functions/fetchPoolLiquidity';
import { scaleData } from '../../pages/Trade/TradeCharts/TradeCandleStickChart';
import { LimitOrderIF } from '../interfaces/LimitOrderIF';
import { PositionIF } from '../interfaces/PositionIF';
import { TransactionIF } from '../interfaces/TransactionIF';
import { CandlesByPoolAndDuration } from '../state/graphDataSlice';

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

export function diffHashSigScaleData(
    scaleData?: scaleData,
    axis: string | undefined = undefined,
) {
    if (!scaleData) {
        return 'null';
    }

    if (axis === 'x') {
        return JSON.stringify(scaleData?.xScale.domain());
    }

    if (axis === 'y') {
        return JSON.stringify(scaleData?.yScale.domain());
    }

    return diffHashSig({
        xScaleDomain: scaleData?.xScale.domain(),
        xScaleRange: scaleData?.xScale.range(),
        yScaleDomain: scaleData?.yScale.domain(),
        yScaleRange: scaleData?.yScale.range(),
        volumeScaleDomain: scaleData?.volumeScale.domain(),
        volumeScaleRange: scaleData?.volumeScale.range(),
    });
}

export function diffHashSigLiquidity(liquidity?: LiquidityDataIF) {
    if (!liquidity) {
        return 'null';
    }
    if (liquidity.ranges.length == 0) {
        return 'empty';
    }

    return diffHashSig({
        time: liquidity,
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
    return diffHashSig(
        txs.map((x) => {
            x.limitOrderId, x.latestUpdateTime;
        }),
    );
}

export function diffHashSigPostions(txs?: PositionIF[]) {
    if (!txs) {
        return 'null';
    }
    return diffHashSig(
        txs.map((x) => {
            x.positionId, x.latestUpdateTime;
        }),
    );
}
