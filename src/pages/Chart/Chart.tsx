import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import './Chart.css';
import { CartesianChart, Scale } from '@d3fc/d3fc-chart/src/cartesian';

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
    console.log('Helooo');
    const [chart, setChart] = useState<CartesianChart<Scale, Scale>>();

    useEffect(() => {
        console.log('init chart');
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

        const horizontalLine = d3fc.annotationSvgLine().value((d: any) => d.value);

        const valueFormatter = d3.format('.2f');

        const drag = d3.drag().on('drag', function (event, d: any) {
            const plotY = d3.pointer(event, d3.select('.plot-chart').select('svg'))[1];
            console.log('y: ', plotY, ' invert: ', yScale.invert(plotY));

            d.value = yScale.invert(d3.pointer(event)[1] - 26);
            setTargets(d);
        });
        horizontalLine.decorate((selection: any) => {
            selection.enter().select('g.left-handle').append('text').attr('x', 5).attr('y', -5);
            selection.enter().select('line').attr('stroke', 'red').call(drag);
            selection
                .select('g.left-handle text')
                .text((d: any) => d.name + ' - ' + valueFormatter(d.value));
            selection
                .on('mouseover', (event: any, data: any) => {
                    d3.select(event.currentTarget).select('line').style('cursor', 'ns-resize');
                })
                .on('mouseout', (event: any, data: any) => {
                    d3.select(event.currentTarget).select('line').style('cursor', 'default');
                });
        });

        const xAxisJoin = d3fc.dataJoin('g', 'x-axis');
        const yAxisJoin = d3fc.dataJoin('g', 'y-axis');

        const multi = d3fc
            .seriesSvgMulti()
            .series([gridlines, candlestick, horizontalLine])
            .mapping((dta: any, index: number, series: any[]) => {
                switch (series[index]) {
                    case gridlines:
                    case candlestick:
                        return dta;
                    case horizontalLine:
                        return targets;
                }
            });

        const chrt = d3fc.chartCartesian(xScale, yScale).svgPlotArea(multi);
        chrt.xDomain(xExtent(data));
        chrt.yDomain(yExtent(data));
        d3.select(d3Container.current).datum(data).call(chrt);
        // setChart(chrt);
    }, []);

    useEffect(() => {
        console.log('Redraw');
        if (chart != null) {
            d3.select(d3Container.current).datum(data).call(chart);
        }
    }, [targets, data, chart]);

    return <div ref={d3Container} className='main_layout' data-testid={'chart'}></div>;
}
