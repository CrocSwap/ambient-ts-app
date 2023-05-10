// import sum from 'hash-sum';

import { ChartUtils } from '../../pages/Trade/TradeCharts/TradeCandleStickChart';
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

export function diffHashSigChart(chart?: ChartUtils) {
    if (!chart) {
        return 'null';
    }
    if (chart.chartData.length === 0) {
        return 'empty';
    }
    return diffHashSig({
        period: chart.period,
        length: chart.chartData.length,
        chart: chart.chartData[0],
        tvl: chart.tvlChartData[0],
        volume: chart.volumeChartData[0],
        fee: chart.feeChartData[0],
        pool: chart.poolAdressComb,
    });
}

export function diffHashSigTxs(txs?: TransactionIF[]) {
    if (!txs) {
        return 'null';
    }
    return diffHashSig(txs.map((x) => x.tx));
}
