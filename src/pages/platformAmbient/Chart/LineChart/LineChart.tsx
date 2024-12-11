import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { useContext, useEffect, useRef, useState } from 'react';
import { IS_LOCAL_ENV } from '../../../../ambient-utils/constants';
import {
    diffHashSig,
    diffHashSigScaleData,
} from '../../../../ambient-utils/dataLayer';
import { CandleDataIF } from '../../../../ambient-utils/types';
import { ChartThemeIF } from '../../../../ambient-utils/types/contextTypes';
import { ChartContext } from '../../../../contexts/ChartContext';
import {
    CandleDataChart,
    renderCanvasArray,
    scaleData,
    setCanvasResolution,
} from '../ChartUtils/chartUtils';

interface LineChartIF {
    period: number;
    scaleData: scaleData | undefined;
    denomInBase: boolean;
    data: CandleDataChart[];
    showLatest: boolean | undefined;
    lastCandleData: CandleDataIF;
    prevlastCandleTime: number;
    setPrevLastCandleTime: React.Dispatch<React.SetStateAction<number>>;
    chartThemeColors: ChartThemeIF | undefined;
    showFutaCandles: boolean;
}

export default function CandleLineChart(props: LineChartIF) {
    const {
        scaleData,
        denomInBase,
        data,
        showLatest,
        lastCandleData,
        period,
        prevlastCandleTime,
        setPrevLastCandleTime,
        chartThemeColors,
        showFutaCandles,
    } = props;

    const d3CanvasArea = useRef(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [candleLine, setCandleLine] = useState<any>();

    const { tradeTableState } = useContext(ChartContext);

    useEffect(() => {
        IS_LOCAL_ENV && console.debug('re-rending chart');
        if (tradeTableState === 'Expanded') return;
        if (data && data.length > 0 && scaleData && showFutaCandles) {
            if (!showLatest) {
                const domainLeft = scaleData?.xScale.domain()[0];
                const domainRight = scaleData?.xScale.domain()[1];

                const count = data.filter(
                    (i: CandleDataChart) =>
                        i.time <= lastCandleData.time - period &&
                        i.time >= prevlastCandleTime,
                ).length;
                setPrevLastCandleTime(lastCandleData.time - period);

                scaleData?.xScale.domain([
                    domainLeft + count * period * 1000,
                    domainRight + count * period * 1000,
                ]);
            }
        }
    }, [tradeTableState, lastCandleData?.time, showFutaCandles]);

    useEffect(() => {
        if (scaleData !== undefined && chartThemeColors && d3CanvasArea) {
            const canvas = d3
                .select(d3CanvasArea.current)
                .select('canvas')
                .node() as HTMLCanvasElement;

            const style = getComputedStyle(canvas);

            const candleLine = d3fc
                .seriesCanvasLine()
                .mainValue((d: CandleDataIF) =>
                    denomInBase
                        ? d.invPriceCloseExclMEVDecimalCorrected
                        : d.priceCloseExclMEVDecimalCorrected,
                )
                .crossValue((d: CandleDataIF) => d.time * 1000)
                .curve(d3.curveLinear)
                .xScale(scaleData.xScale)
                .yScale(scaleData.yScale)
                .decorate((context: CanvasRenderingContext2D) => {
                    context.strokeStyle = style.getPropertyValue('--accent1');

                    context.shadowColor = style.getPropertyValue('--accent1');
                    context.shadowBlur = 7;
                    context.shadowOffsetX = 1;
                    context.shadowOffsetY = 1;

                    context.lineWidth = 1.5;
                });

            setCandleLine(() => candleLine);
        }
    }, [scaleData, denomInBase, chartThemeColors]);

    useEffect(() => {
        const canvas = d3
            .select(d3CanvasArea.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        if (candleLine) {
            d3.select(d3CanvasArea.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);
                    if (data !== undefined) {
                        candleLine(data);
                    }
                })
                .on('measure', (event: CustomEvent) => {
                    scaleData?.xScale.range([0, event.detail.width]);
                    scaleData?.yScale.range([event.detail.height, 0]);
                    candleLine.context(ctx);
                });

            renderCanvasArray([d3CanvasArea]);
        }
    }, [data, candleLine]);

    useEffect(() => {
        renderCanvasArray([d3CanvasArea]);
    }, [
        diffHashSigScaleData(scaleData),
        diffHashSig(chartThemeColors),
        diffHashSig(showFutaCandles),
    ]);

    return (
        <d3fc-canvas ref={d3CanvasArea} className='line-canvas'></d3fc-canvas>
    );
}
