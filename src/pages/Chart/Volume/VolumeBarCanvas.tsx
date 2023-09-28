import { useEffect, useRef, useState } from 'react';

import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { CandleData } from '../../../App/functions/fetchCandleSeries';
import { scaleData, setCanvasResolution } from '../ChartUtils/chartUtils';

interface propsIF {
    scaleData: scaleData | undefined;
    selectedDate: number | undefined;
    denomInBase: boolean;
    volumeData: Array<CandleData>;
    showVolume: boolean;
}

export default function VolumeBarCanvas(props: propsIF) {
    const { scaleData, selectedDate, denomInBase, volumeData, showVolume } =
        props;

    const d3CanvasBar = useRef<HTMLCanvasElement | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [barSeries, setBarSeries] = useState<any>();

    useEffect(() => {
        if (scaleData !== undefined) {
            const canvasBarChart = d3fc
                .autoBandwidth(d3fc.seriesCanvasBar())
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.volumeScale)
                .crossValue((d: CandleData) => d.time * 1000)
                .mainValue((d: CandleData) => (d.volumeUSD ? d.volumeUSD : 0));

            setBarSeries(() => canvasBarChart);
        }
    }, [scaleData?.xScale, scaleData?.volumeScale]);

    useEffect(() => {
        if (barSeries) {
            barSeries.decorate(
                (context: CanvasRenderingContext2D, d: CandleData) => {
                    const close = denomInBase
                        ? d.invPriceCloseExclMEVDecimalCorrected
                        : d.priceCloseExclMEVDecimalCorrected;

                    const open = denomInBase
                        ? d.invPriceOpenExclMEVDecimalCorrected
                        : d.priceOpenExclMEVDecimalCorrected;

                    context.fillStyle =
                        d.volumeUSD === null
                            ? 'transparent'
                            : selectedDate !== undefined &&
                              selectedDate === d.time * 1000
                            ? '#E480FF'
                            : close > open
                            ? 'rgba(205,193,255, 0.5)'
                            : 'rgba(115,113,252, 0.5)';

                    context.strokeStyle =
                        d.volumeUSD === null || d.volumeUSD === 0
                            ? 'transparent'
                            : selectedDate !== undefined &&
                              selectedDate === d.time * 1000
                            ? '#E480FF'
                            : close > open
                            ? 'rgba(205,193,255, 0.5)'
                            : 'rgba(115,113,252, 0.5)';
                },
            );
        }
    }, [barSeries, selectedDate]);

    useEffect(() => {
        if (showVolume) {
            d3.select(d3CanvasBar.current)
                .select('canvas')
                .style('display', 'inline');
        } else {
            d3.select(d3CanvasBar.current)
                .select('canvas')
                .style('display', 'none');
        }
    }, [showVolume]);

    useEffect(() => {
        const canvas = d3
            .select(d3CanvasBar.current)
            .select('canvas')
            .node() as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        if (barSeries) {
            d3.select(d3CanvasBar.current)
                .on('draw', () => {
                    setCanvasResolution(canvas);
                    barSeries(volumeData);
                })
                .on('measure', (event: CustomEvent) => {
                    scaleData?.volumeScale.range([
                        event.detail.height,
                        event.detail.height - event.detail.height / 5,
                    ]);
                    barSeries.context(ctx);
                });
        }
    }, [volumeData, barSeries]);

    return (
        <d3fc-canvas
            ref={d3CanvasBar}
            className='volume-canvas'
            style={{
                position: 'relative',
                height: '50%',
                marginBottom: '0',
                marginTop: 'auto',
            }}
        ></d3fc-canvas>
    );
}
