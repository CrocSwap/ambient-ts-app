// eslint-disable-next-line quotes
import { DetailedHTMLProps, HTMLAttributes, MutableRefObject } from 'react';
import * as d3 from 'd3';
import { LiquidityDataLocal } from '../../Trade/TradeCharts/TradeCharts';
import { CandleData } from '../../../App/functions/fetchCandleSeries';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'd3fc-group': DetailedHTMLProps<
                HTMLAttributes<HTMLDivElement>,
                HTMLDivElement
            >;
            'd3fc-svg': DetailedHTMLProps<
                HTMLAttributes<HTMLDivElement>,
                HTMLDivElement
            >;
            'd3fc-canvas': DetailedHTMLProps<
                HTMLAttributes<HTMLCanvasElement | HTMLDivElement>,
                HTMLCanvasElement | HTMLDivElement
            >;
        }
    }
}

export const defaultCandleBandwith = 5;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type lineData = { x: number; y: number; ctx: any };
export type drawDataHistory = { data: lineData[]; type: string; time: number };
export type bandLineData = { fromValue: number; toValue: number };
export interface CandleDataChart extends CandleData {
    isFakeData: boolean;
}
export type liquidityChartData = {
    liqAskData: LiquidityDataLocal[];
    liqBidData: LiquidityDataLocal[];
    depthLiqBidData: LiquidityDataLocal[];
    depthLiqAskData: LiquidityDataLocal[];
    topBoundary: number;
    lowBoundary: number;
    liqTransitionPointforCurve: number;
    liqTransitionPointforDepth: number;
};

export type scaleData = {
    xScale: d3.ScaleLinear<number, number>;
    xScaleTime: d3.ScaleTime<number, number>;
    yScale: d3.ScaleLinear<number, number>;
    volumeScale: d3.ScaleLinear<number, number>;
    xExtent: [number, number];
};

export type crosshair = {
    x: number | Date;
    y: number | string;
};
export type chartItemStates = {
    showTvl: boolean;
    showVolume: boolean;
    showFeeRate: boolean;
    liqMode: string;
};

export type lineValue = {
    name: string;
    value: number;
};

export interface SubChartValue {
    name: string;
    value: number | undefined;
}

export type zoomUtils = {
    zoom: d3.ZoomBehavior<Element, unknown>;
    xAxisZoom: d3.ZoomBehavior<Element, unknown>;
};

export function setCanvasResolution(canvas: HTMLCanvasElement) {
    const ratio = window.devicePixelRatio < 1 ? 1 : window.devicePixelRatio;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (canvas !== null) {
        const width = canvas.width;
        const height = canvas.height;
        canvas.width = width * ratio;
        canvas.height = height * ratio;

        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        context.scale(ratio, ratio);
    }
}

export function renderCanvasArray(
    canvasArray: MutableRefObject<HTMLDivElement | HTMLCanvasElement | null>[],
) {
    canvasArray.forEach((canvas) => {
        if (canvas && canvas.current) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const container = d3.select(canvas.current).node() as any;
            if (container) container.requestRedraw();
        }
    });
}

export const renderSubchartCrCanvas = () => {
    const feeRateCrCanvas = d3
        .select('#fee_rate_chart')
        .select('#d3CanvasCrosshair');

    if (feeRateCrCanvas) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nd = feeRateCrCanvas.node() as any;
        if (nd) nd.requestRedraw();
    }

    const tvlCrCanvas = d3.select('#tvl_chart').select('#d3CanvasCrosshair');

    if (tvlCrCanvas) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nd = tvlCrCanvas.node() as any;
        if (nd) nd.requestRedraw();
    }

    const tvlYaxisCanvas = d3.select('#tvl_chart').select('#y-axis-canvas_tvl');

    if (tvlYaxisCanvas) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nd = tvlYaxisCanvas.node() as any;
        if (nd) nd.requestRedraw();
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function standardDeviation(arr: any, usePopulation = false) {
    const mean =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        arr.reduce((acc: any, val: any) => acc + val, 0) / arr.length;
    return Math.sqrt(
        arr
            .reduce(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (acc: any, val: any) => acc.concat((val - mean) ** 2),
                [],
            )
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .reduce((acc: any, val: any) => acc + val, 0) /
            (arr.length - (usePopulation ? 0 : 1)),
    );
}

export function fillLiqAdvanced(
    standardDeviation: number,
    scaleData: scaleData,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    liquidityData: any,
) {
    const border = scaleData?.yScale.domain()[1];

    const filledTickNumber = Math.min(border / standardDeviation, 150);

    standardDeviation =
        filledTickNumber === 150
            ? (border - liquidityData?.liqBidData[0]?.liqPrices) / 150
            : standardDeviation;

    if (scaleData !== undefined) {
        if (
            border + standardDeviation >=
            liquidityData?.liqBidData[0]?.liqPrices
        ) {
            for (let index = 0; index < filledTickNumber; index++) {
                liquidityData?.liqBidData.unshift({
                    activeLiq: 30,
                    liqPrices:
                        liquidityData?.liqBidData[0]?.liqPrices +
                        standardDeviation,
                    deltaAverageUSD: 0,
                    cumAverageUSD: 0,
                });

                liquidityData?.depthLiqBidData.unshift({
                    activeLiq: liquidityData?.depthLiqBidData[1]?.activeLiq,
                    liqPrices:
                        liquidityData?.depthLiqBidData[0]?.liqPrices +
                        standardDeviation,
                    deltaAverageUSD: 0,
                    cumAverageUSD: 0,
                });
            }
        }
    }
}
