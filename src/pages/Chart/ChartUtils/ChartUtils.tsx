import * as d3fc from 'd3fc';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function BarSeries(
    scaleData: any,
    liquidityData: any,
    setBarSeries: React.Dispatch<React.SetStateAction<any>>,
) {
    if (scaleData !== undefined && liquidityData !== undefined) {
        const barSeries = d3fc
            .seriesSvgBar()
            .orient('horizontal')
            .align('right')
            .mainValue((d: any) => d.activeLiq)
            .crossValue((d: any) => d.liqPrices)
            .xScale(scaleData?.liquidityScale)
            .yScale(scaleData?.yScale)
            .bandwidth(function (value: any) {
                return scaleData?.yScale(value.width) / 165;
            })
            .decorate((selection: any) => {
                selection
                    .enter()
                    .select('.bar > path')
                    .style('fill', (d: any) => {
                        return d.liqPrices > scaleData?.barThreshold
                            ? 'rgba(115, 113, 252, 0.3)'
                            : 'rgba(205, 193, 255, 0.3)';
                    });
            });

        setBarSeries(() => {
            return barSeries;
        });
    }
}
