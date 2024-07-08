import { useEffect, useRef /* useState */ } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { renderCanvasArray } from '../../../../pages/platformAmbient/Chart/ChartUtils/chartUtils';

interface AxisIF {
    data: number[];
    scale: d3.ScaleLinear<number, number> | undefined;
    afterOneWeek: boolean;
    axisColor: string;
    textColor: string;
}
export default function Xaxis(props: AxisIF) {
    const d3XaxisRef = useRef<HTMLInputElement | null>(null);
    const { data, scale, afterOneWeek, axisColor, textColor } = props;

    useEffect(() => {
        if (scale) {
            const xAxis = d3
                .axisBottom(scale)
                .tickValues(
                    afterOneWeek
                        ? d3.range(0, 1441, 60)
                        : d3.range(0, 1441 * 8, 1441 / 2),
                )
                .tickFormat((d) => {
                    const hour = d.valueOf() / (afterOneWeek ? 60 : 1441);
                    if (Number.isInteger(d)) {
                        return hour.toString();
                    }

                    return '12h';
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
                d3LinearAxisJoin(svg, [data]).call(xAxis);
            });
        }

        renderCanvasArray([d3XaxisRef]);
    }, [scale, d3XaxisRef]);

    return (
        <d3fc-svg
            ref={d3XaxisRef}
            style={{
                gridColumnStart: 2,
                gridColumnEnd: 4,
                gridRowStart: 2,
                gridRowEnd: 4,
                height: '100%',
                width: '100%',
            }}
        ></d3fc-svg>
    );
}
