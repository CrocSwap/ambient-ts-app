import { useEffect, useRef, useState } from 'react';

import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { CandleDataIF } from '../../../../ambient-utils/types';
import { scaleData, setCanvasResolution } from '../ChartUtils/chartUtils';
import { ChartThemeIF } from '../../../../contexts/ChartContext';

interface propsIF {
    scaleData: scaleData | undefined;
    selectedDate: number | undefined;
    denomInBase: boolean;
    volumeData: Array<CandleDataIF>;
    showVolume: boolean;
    visibleDateForCandle: number;
    chartThemeColors: ChartThemeIF | undefined;
}

export default function VolumeBarCanvas(props: propsIF) {
    const {
        scaleData,
        selectedDate,
        denomInBase,
        volumeData,
        showVolume,
        visibleDateForCandle,
        chartThemeColors,
    } = props;

    const d3CanvasBar = useRef<HTMLCanvasElement | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [barSeries, setBarSeries] = useState<any>();

    useEffect(() => {
        if (scaleData !== undefined) {
            const canvasBarChart = d3fc
                .autoBandwidth(d3fc.seriesCanvasBar())
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.volumeScale)
                .crossValue((d: CandleDataIF) => d.time * 1000)
                .mainValue((d: CandleDataIF) =>
                    d.volumeUSD ? d.volumeUSD : 0,
                );

            setBarSeries(() => canvasBarChart);
        }
    }, [scaleData?.xScale, scaleData?.volumeScale]);

    useEffect(() => {
        if (barSeries && chartThemeColors) {
            const canvas = d3
                .select(d3CanvasBar.current)
                .select('canvas')
                .node() as HTMLCanvasElement;

            barSeries.decorate(
                (context: CanvasRenderingContext2D, d: CandleDataIF) => {
                    const d3DarkStrokeColor =
                        chartThemeColors.downCandleBorderColor?.copy();
                    const d3LightStrokeColor =
                        chartThemeColors.upCandleBorderColor?.copy();

                    if (d3DarkStrokeColor) d3DarkStrokeColor.opacity = 0.5;
                    if (d3LightStrokeColor) d3LightStrokeColor.opacity = 0.5;

                    const close = denomInBase
                        ? d.invPriceCloseExclMEVDecimalCorrected
                        : d.priceCloseExclMEVDecimalCorrected;

                    const open = denomInBase
                        ? d.invPriceOpenExclMEVDecimalCorrected
                        : d.priceOpenExclMEVDecimalCorrected;

                    const style = getComputedStyle(canvas);

                    context.fillStyle =
                        d.volumeUSD === null
                            ? 'transparent'
                            : selectedDate !== undefined &&
                                selectedDate === d.time * 1000
                              ? '#E480FF'
                              : close > open
                                ? style.getPropertyValue('--accent5')
                                : style.getPropertyValue('--accent1');

                    context.strokeStyle =
                        d.volumeUSD === null || d.volumeUSD === 0
                            ? 'transparent'
                            : selectedDate !== undefined &&
                                selectedDate === d.time * 1000
                              ? '#E480FF'
                              : close > open
                                ? style.getPropertyValue('--accent5')
                                : style.getPropertyValue('--accent1');

                    if (d.time * 1000 > visibleDateForCandle) {
                        context.fillStyle = 'transparent';
                        context.strokeStyle = 'transparent';
                    }
                },
            );
        }
    }, [
        barSeries,
        selectedDate,
        visibleDateForCandle,
        chartThemeColors,
        denomInBase,
    ]);

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
