/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MAX_UINT128 } from '../../../constants';
import { fetchTicksSurroundingPrice, TickProcessed } from '../../../data/pools/tickData';
import { useClients } from '../../../state/application/hooks';
import { usePoolDatas, usePoolTickData } from '../../../state/pools/hooks';
import { PoolData } from '../../../state/pools/models';
import { isAddress } from '../../../utils';
import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { TickMath, FeeAmount, TICK_SPACINGS, Pool } from '@uniswap/v3-sdk';
import { CurrencyAmount, Token } from '@uniswap/sdk-core';
import JSBI from 'jsbi';
import { motion } from 'framer-motion';
import styles from './LiquidityChart.module.css';
import { formatAmount } from '../../../utils/numbers';

interface LiquidtiyData {
    address: string;
    value?: number;
    label?: string;
}

export interface ChartEntry {
    index: number;
    isCurrent: boolean;
    activeLiquidity: number;
    price0: number;
    price1: number;
    tvlToken0: number;
    tvlToken1: number;
}

const INITIAL_TICKS_TO_FETCH = 200;

export default function LiquidityChart(props: LiquidtiyData) {
    const address = props.address;
    const { dataClient } = useClients();

    const poolData: PoolData = usePoolDatas([address])[0];
    const formattedAddress0 = isAddress(poolData.token0.address);
    const formattedAddress1 = isAddress(poolData.token1.address);
    const feeTier = poolData?.feeTier;

    const token0 = useMemo(() => {
        return poolData && formattedAddress0 && formattedAddress1
            ? new Token(1, formattedAddress0, poolData.token0.decimals)
            : undefined;
    }, [formattedAddress0, formattedAddress1, poolData]);
    const token1 = useMemo(() => {
        return poolData && formattedAddress1 && formattedAddress1
            ? new Token(1, formattedAddress1, poolData.token1.decimals)
            : undefined;
    }, [formattedAddress1, poolData]);

    const [poolTickData, updatePoolTickData] = usePoolTickData(address);
    const [ticksToFetch] = useState(INITIAL_TICKS_TO_FETCH);
    const amountTicks = ticksToFetch * 2 + 1;

    const [currentData, setCurrentData] = useState<ChartEntry>();
    const [tickData, setTickData] = useState<ChartEntry>();

    useEffect(() => {
        async function fetch() {
            const { data } = await fetchTicksSurroundingPrice(address, dataClient, ticksToFetch);
            if (data) {
                updatePoolTickData(address, data);
            }
        }
        if (!poolTickData || (poolTickData && poolTickData.ticksProcessed.length < amountTicks)) {
            fetch();
        }
    }, [address, poolTickData, updatePoolTickData, ticksToFetch, amountTicks, dataClient]);

    const [formattedData, setFormattedData] = useState<ChartEntry[] | undefined>();
    useEffect(() => {
        async function formatData() {
            if (poolTickData) {
                const newData = await Promise.all(
                    poolTickData.ticksProcessed.map(async (t: TickProcessed, i) => {
                        const active = t.tickIdx === poolTickData.activeTickIdx;
                        const sqrtPriceX96 = TickMath.getSqrtRatioAtTick(t.tickIdx);
                        const feeAmount: FeeAmount = poolData.feeTier;
                        const mockTicks = [
                            {
                                index: t.tickIdx - TICK_SPACINGS[feeAmount],
                                liquidityGross: t.liquidityGross,
                                liquidityNet: JSBI.multiply(t.liquidityNet, JSBI.BigInt('-1')),
                            },
                            {
                                index: t.tickIdx,
                                liquidityGross: t.liquidityGross,
                                liquidityNet: t.liquidityNet,
                            },
                        ];
                        const pool =
                            token0 && token1 && feeTier
                                ? new Pool(
                                      token0,
                                      token1,
                                      feeTier,
                                      sqrtPriceX96,
                                      t.liquidityActive,
                                      t.tickIdx,
                                      mockTicks,
                                  )
                                : undefined;
                        const nextSqrtX96 = poolTickData.ticksProcessed[i - 1]
                            ? TickMath.getSqrtRatioAtTick(
                                  poolTickData.ticksProcessed[i - 1].tickIdx,
                              )
                            : undefined;
                        const maxAmountToken0 = token0
                            ? CurrencyAmount.fromRawAmount(token0, MAX_UINT128.toString())
                            : undefined;
                        const outputRes0 =
                            pool && maxAmountToken0
                                ? await pool.getOutputAmount(maxAmountToken0, nextSqrtX96)
                                : undefined;

                        const token1Amount = outputRes0?.[0] as CurrencyAmount<Token> | undefined;

                        const amount0 = token1Amount
                            ? parseFloat(token1Amount.toExact()) * parseFloat(t.price1)
                            : 0;
                        const amount1 = token1Amount ? parseFloat(token1Amount.toExact()) : 0;

                        return {
                            index: i,
                            isCurrent: active,
                            activeLiquidity: parseFloat(t.liquidityActive.toString()),
                            price0: parseFloat(t.price0),
                            price1: parseFloat(t.price1),
                            tvlToken0: amount0,
                            tvlToken1: amount1,
                        };
                    }),
                );
                // offset the values to line off bars with TVL used to swap across bar
                newData?.map((entry, i) => {
                    if (i > 0) {
                        newData[i - 1].tvlToken0 = entry.tvlToken0;
                        newData[i - 1].tvlToken1 = entry.tvlToken1;
                    }
                });

                if (newData) {
                    setFormattedData(newData);
                }
                return;
            } else {
                return [];
            }
        }
        if (!formattedData) {
            formatData();
        }
    }, [feeTier, formattedData, poolData.feeTier, poolTickData, token0, token1]);

    useEffect(() => {
        setFormattedData(undefined);
    }, [address]);

    useEffect(() => {
        setCurrentData(formattedData?.find((item: ChartEntry) => item.isCurrent === true));

        drawChart();
    }, [formattedData]);

    const drawChart = useCallback(() => {
        if (formattedData != undefined) {
            console.log('Draw Chart');
            const chartData = {
                lineseries: formattedData,
                crosshair: [{ x: 200, y: 200 }],
                lineWidth: 1,
                tooltipData: [
                    {
                        token0Price: 0,
                        token1Price: 0,
                        shownSideLocked: 0,
                    },
                ],
            };

            const render = () => {
                d3.select('#chart-element').datum(chartData).call(chart);

                const pointer = d3fc.pointer().on('point', (event: any) => {
                    if (event[0] !== undefined) {
                        chartData.crosshair = snap(lineSeries, chartData.lineseries, event[0]);
                        render();
                    }
                });
                d3.select('#chart-element .plot-area').call(pointer);
            };

            const minimum = (data: any, accessor: any) => {
                return data
                    .map(function (dataPoint: any, index: any) {
                        return [accessor(dataPoint, index), dataPoint, index];
                    })
                    .reduce(
                        function (accumulator: any, dataPoint: any) {
                            return accumulator[0] > dataPoint[0] ? dataPoint : accumulator;
                        },
                        [Number.MAX_VALUE, null, -1],
                    );
            };

            const snap = (series: any, data: any, point: any) => {
                if (point == undefined) return [];
                const xScale = series.xScale(),
                    xValue = series.crossValue();

                const filtered = data.filter((d: any) => xValue(d) != null);
                const nearest = minimum(filtered, (d: any) =>
                    Math.abs(point.x - xScale(xValue(d))),
                )[1];
                setTickData(nearest);
                const newX = nearest.index;
                return [
                    {
                        x: xScale(newX),
                        y: point.y,
                    },
                ];
            };

            const yExtent = d3fc
                .extentLinear()
                .accessors([(d: any) => d.activeLiquidity])
                .pad([0, 0.1]);

            const xScale = d3.scaleLinear();
            const yScale = d3.scaleLinear();

            xScale.domain([chartData.lineseries.length, 0]);
            yScale.domain(yExtent(chartData.lineseries));

            const xScaleOriginal = xScale.copy();

            const lineSeries = d3fc
                .autoBandwidth(d3fc.seriesSvgBar())
                .xScale(xScale)
                .yScale(yScale)
                .align('center')
                .crossValue((d: any) => d.index)
                .mainValue((d: any) => d.activeLiquidity)
                .decorate((selection: any) => {
                    selection
                        .enter()
                        .style('fill', (d: any) =>
                            d.isCurrent
                                ? '#F7385B'
                                : d.index < (chartData.lineseries.length - 1) / 2
                                ? '#CDC1FF'
                                : '#7371FC',
                        );
                });

            const crosshair = d3fc
                .annotationSvgCrosshair()
                .xLabel('')
                .yLabel('')
                .decorate((sel: any) => {
                    sel.selectAll('.point>path').attr('visibility', 'hidden');
                    sel.enter().style('pointer-events', 'all');
                    sel.enter().select('g.annotation-line.horizontal').attr('visibility', 'hidden');
                    sel.enter()
                        .select('g.annotation-line.vertical')
                        .style('stroke', 'rgb(242,243,245,0.7)')
                        .attr('stroke-width', 2);
                });

            const zoom = d3
                .zoom()
                .scaleExtent([1, 20])
                .on('zoom', (event: any) => {
                    xScale.domain(event.transform.rescaleX(xScaleOriginal).domain());

                    d3.select('g.annotation-line.vertical')
                        .attr('stroke-width', event.transform.k * 2 + event.transform.k / 1.5)
                        .style('pointer-events', 'all');

                    render();
                });

            const multi = d3fc
                .seriesSvgMulti()
                .series([crosshair, lineSeries])
                .mapping((data: any, index: any, series: any) => {
                    if (data.loading) {
                        return [];
                    }
                    switch (series[index]) {
                        case crosshair:
                            return data.crosshair;
                        default:
                            return data.lineseries;
                    }
                });

            const chart = d3fc
                .chartCartesian(xScale, yScale)
                .yOrient('right')
                .svgPlotArea(multi)
                .decorate((sel: any) => {
                    sel.enter()
                        .select('d3fc-svg.plot-area')
                        .on('measure.range', (event: any) => {
                            xScaleOriginal.range([0, event.detail.width]);
                        })
                        .call(zoom);

                    sel.enter().style('min-height', '50px');
                })
                .xDecorate((sel: any) => {
                    sel.enter().attr('visibility', 'hidden');
                })
                .yDecorate((sel: any) => {
                    sel.enter().attr('visibility', 'hidden');
                });

            render();
        }
    }, [formattedData]);

    return (
        <>
            <div style={{ height: '80%', width: '100%' }} id='chart-element'></div>
            <div className={styles.centerBox}>
                <div className={styles.singleBox}>
                    <motion.div
                        id='current-element'
                        layoutId='outline'
                        className={styles.outline}
                        initial={false}
                        animate={{ borderColor: 'red' }}
                    >
                        <div className={styles.kHKQUR}>
                            <div className={styles.eJnjNO}>
                                <div style={{ margin: '0 4px 0 0' }}>Current Price</div>
                                <div className={styles.currentPink} />
                            </div>
                        </div>

                        <div>
                            {`1 ${poolData.token0.symbol} = ${Number(
                                currentData?.price0,
                            ).toLocaleString(undefined, {
                                minimumSignificantDigits: 1,
                            })} ${poolData.token1.symbol}`}
                        </div>
                        <div>
                            {`1 ${poolData.token1.symbol} = ${Number(
                                currentData?.price1,
                            ).toLocaleString(undefined, {
                                minimumSignificantDigits: 1,
                            })} ${poolData.token0.symbol}`}
                        </div>
                    </motion.div>
                </div>

                <div className={styles.singleBox}>
                    <motion.div
                        id='crosshair-element'
                        layoutId='outline'
                        className={styles.outline}
                        initial={false}
                        animate={{ borderColor: 'red' }}
                    >
                        <div className={styles.kHKQUR}>
                            <div className={styles.eJnjNO}>
                                <div style={{ margin: '0 4px 0 0' }}>Tick Stats</div>
                                <div className={styles.currentPink} />
                            </div>
                        </div>

                        <div>
                            {` ${poolData.token0.symbol} Price: = ${Number(
                                tickData?.price0,
                            ).toLocaleString(undefined, {
                                minimumSignificantDigits: 1,
                            })} ${poolData.token1.symbol}`}
                        </div>
                        <div>
                            {` ${poolData.token1.symbol} Price: = ${Number(
                                tickData?.price1,
                            ).toLocaleString(undefined, {
                                minimumSignificantDigits: 1,
                            })} ${poolData.token0.symbol}`}
                        </div>

                        <div>
                            {` ${
                                Number(tickData?.index) < Number(currentData?.index)
                                    ? poolData.token1.symbol
                                    : poolData.token0.symbol
                            } Locked: = 
                        ${formatAmount(
                            Number(tickData?.index) < Number(currentData?.index)
                                ? tickData?.tvlToken1
                                : tickData?.tvlToken0,
                        )} ${
                                Number(tickData?.index) < Number(currentData?.index)
                                    ? poolData.token1.symbol
                                    : poolData.token0.symbol
                            }`}
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
