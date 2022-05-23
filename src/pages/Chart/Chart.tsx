import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import './Chart.css';

export default function Chart() {
    const d3Container = useRef(null);

    useEffect(() => {
        const data = d3fc.randomFinancial()(50);
        const targets = [
            {
                name: 'high',
                value: 98.42,
            },
            {
                name: 'low',
                value: 97.2,
            },
        ];

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

        const chart = d3fc.chartCartesian(xScale, yScale).svgPlotArea(multi);

        chart.xDomain(xExtent(data));
        chart.yDomain(yExtent(data));
        d3.select(d3Container.current).datum(data).call(chart);
    }, []);

    return <div ref={d3Container} className='main_layout' data-testid={'chart'}></div>;
}
