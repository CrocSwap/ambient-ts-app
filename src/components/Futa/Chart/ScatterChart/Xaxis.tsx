import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { useEffect, useRef /* useState */ } from 'react';
import { renderCanvasArray } from '../../../../pages/platformAmbient/Chart/ChartUtils/chartUtils';

interface AxisIF {
    data: number[];
    scale: d3.ScaleLinear<number, number> | undefined;
    afterOneWeek: boolean;
    axisColor: string;
    textColor: string;
    showDayCount: number;
    calculateXTickStep: (showDayCount: number) => number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chartSize: any;
    showComplete: boolean;
}
export default function Xaxis(props: AxisIF) {
    const d3XaxisRef = useRef<HTMLInputElement | null>(null);
    const {
        data,
        scale,
        afterOneWeek,
        axisColor,
        textColor,
        showDayCount,
        calculateXTickStep,
        chartSize,
        showComplete,
    } = props;

    useEffect(() => {
        if (scale) {
            const xAxis = d3
                .axisBottom(scale)
                .tickValues(
                    afterOneWeek && !showComplete
                        ? d3.range(0, 1441, 60)
                        : d3.range(
                              0,
                              scale.domain()[0],
                              calculateXTickStep(showDayCount) * 2,
                          ),
                )
                .tickFormat((d) => {
                    if (Number.isInteger(d)) {
                        if (afterOneWeek && !showComplete) {
                            const hour = d.valueOf() / 60;
                            return hour.toString() + 'h';
                        }

                        if (showDayCount > 30) {
                            const week = d.valueOf() / (1441 * 7);
                            return week.toString() + 'w';
                        }

                        const day = d.valueOf() / 1441;

                        if (showDayCount > 20) {
                            if (day % 2 === 1) {
                                return '';
                            }
                        }
                        return day.toString() + 'd';
                    }

                    return '';
                });

            const d3LinearAxisJoin = d3fc.dataJoin('g', 'd3-axis-linear');
            d3.select(d3XaxisRef.current).on('draw', () => {
                const svg = d3.select(d3XaxisRef.current).select('svg');
                svg.select('g')
                    .selectAll('path, line')
                    .attr('stroke', axisColor);
                svg.select('g')
                    .selectAll('text')
                    .attr('fill', textColor)
                    .style('font-family', 'Roboto Mono');

                svg.on('mouseover', function () {
                    d3.select(this)
                        .selectAll('path, line')
                        .attr('stroke', 'var(--accent1)');

                    d3.select(this)
                        .selectAll('text')
                        .attr('fill', 'var(--accent1)');
                }).on('mouseout', function () {
                    d3.select(this)
                        .selectAll('path, line')
                        .attr('stroke', axisColor);

                    d3.select(this).selectAll('text').attr('fill', textColor);
                });

                d3LinearAxisJoin(svg, [data]).call(xAxis);
            });
        }

        renderCanvasArray([d3XaxisRef]);
    }, [scale, d3XaxisRef, showComplete]);

    useEffect(() => {
        renderCanvasArray([d3XaxisRef]);
    }, [chartSize]);

    return (
        <d3fc-svg
            ref={d3XaxisRef}
            style={{
                gridColumnStart: 2,
                gridColumnEnd: 4,
                gridRowStart: 2,
                gridRowEnd: 4,
                minHeight: '10px',
                height: '100%',
                width: '100%',
            }}
        ></d3fc-svg>
    );
}
