import { DetailedHTMLProps, HTMLAttributes, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import './Chart.css';
import { CartesianChart, Scale } from '@d3fc/d3fc-chart/src/cartesian';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            ['d3fc-group']: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
            ['d3fc-svg']: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}

export default function Chart() {
    const d3Container = useRef(null);
    const [data, setData] = useState(d3fc.randomFinancial()(50));
    const [targets, setTargets] = useState([
        {
            name: 'high',
            value: 98.42,
        },
        {
            name: 'low',
            value: 97.2,
        },
    ]);
    // console.log('Helooo');

    useEffect(() => {
        console.log('update chart');
        const yExtent = d3fc.extentLinear().accessors([(d: any) => d.high, (d: any) => d.low]);
        const xExtent = d3fc.extentDate().accessors([(d: any) => d.date]);

        const xScale = d3.scaleTime();
        const yScale = d3.scaleLinear();

        const gridlines = d3fc.annotationSvgGridline();
        const candlestick = d3fc.seriesSvgCandlestick().decorate((selection: any) => {
            selection
                .enter()
                .style('fill', (d: any) => (d.close > d.open ? '#7371FC' : '#CDC1FF'))
                .style('stroke', (d: any) => (d.close > d.open ? '#7371FC' : '#CDC1FF'));
        });

        const barSeries = d3fc
            .autoBandwidth(d3fc.seriesSvgBar())
            // .crossValue(d:any => d.tag)
            .align('left')
            .orient('horizontal')
            .key((d: any) => d.high)
            .mainValue((d: any) => d.volume)
            .xScale(xScale);

        const horizontalLine = d3fc.annotationSvgLine().value((d: any) => d.value);

        const valueFormatter = d3.format('.2f');

        const drag = d3.drag().on('drag', function (event, d: any) {
            const plotY = d3.pointer(event, d3.select('.plot-chart').select('svg'))[1];
            console.log('y: ', plotY, ' invert: ', yScale.invert(d3.pointer(event)[1] - 90));

            const newValue = yScale.invert(d3.pointer(event)[1] - 90);
            setTargets((prevState) => {
                const newTargets = [...prevState];
                newTargets.filter((target: any) => target.name === d.name)[0].value = newValue;
                return newTargets;
            });
        });

        horizontalLine.decorate((selection: any) => {
            selection.enter().select('g.left-handle').append('text').attr('x', 5).attr('y', -5);
            selection.enter().select('line').attr('class', 'redline').attr('stroke', 'red');
            selection
                .select('g.left-handle text')
                .text((d: any) => d.name + ' - ' + valueFormatter(d.value));
            selection
                .enter()
                .append('line')
                .attr('class', 'detector')
                .attr('stroke', 'transparent')
                .attr('x2', '100%')
                .attr('stroke-width', 5)
                .style('pointer-events', 'all')
                .on('mouseover', (event: any, data: any) => {
                    d3.select(event.currentTarget).style('cursor', 'ns-resize');
                })
                .on('mouseout', (event: any, data: any) => {
                    d3.select(event.currentTarget).style('cursor', 'default');
                })
                .call(drag);
        });

        const xAxisJoin = d3fc.dataJoin('g', 'x-axis');
        const yAxisJoin = d3fc.dataJoin('g', 'y-axis');

        const multi = d3fc
            .seriesSvgMulti()
            .series([gridlines, candlestick, horizontalLine, barSeries])
            .mapping((dta: any, index: number, series: any[]) => {
                switch (series[index]) {
                    case gridlines:
                    case candlestick:
                    case barSeries:
                        return dta;
                    case horizontalLine:
                        return targets;
                }
            });

        const chart = d3fc.chartCartesian(xScale, yScale).svgPlotArea(multi);
        chart.xDomain(xExtent(data));
        chart.yDomain(yExtent(data));
        d3.select(d3Container.current).datum(data).call(chart);
    }, [targets, data]);

    return (
        <div ref={d3Container} className='main_layout' data-testid={'chart'}>
            <d3fc-group
                id='group'
                style={{ display: 'flex', height: '100%', width: '100%', flexDirection: 'column' }}
                auto-resize
            >
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <d3fc-svg className='close-axis' style={{ width: '3em' }}></d3fc-svg>
                        <d3fc-svg
                            className='plot-area'
                            style={{ flex: 1, overflow: 'hidden' }}
                        ></d3fc-svg>
                        <d3fc-svg className='open-axis' style={{ width: '3em' }}></d3fc-svg>
                    </div>
                    <d3fc-svg
                        className='x-axis'
                        style={{ height: '2em', marginLeft: '3em', marginRight: '3em' }}
                    ></d3fc-svg>
                </div>
            </d3fc-group>
        </div>
    );
}
