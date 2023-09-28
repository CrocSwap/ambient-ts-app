import { useContext, useEffect, useRef, useState } from 'react';

import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import {
    renderCanvasArray,
    scaleData,
    setCanvasResolution,
} from '../ChartUtils/chartUtils';
import { createTriangle } from '../ChartUtils/triangle';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { tickToPrice } from '@crocswap-libs/sdk';
import { PoolContext } from '../../../contexts/PoolContext';

interface propsIF {
    scaleData: scaleData | undefined;
    isDenomBase: boolean;
    period: number;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    setLimit: any;
    limit: number;
    lineSellColor: string;
    lineBuyColor: string;
    isUserConnected: boolean | undefined;
    poolPriceDisplay: number;
    sellOrderStyle: string;
    checkLimitOrder: boolean;
    setCheckLimitOrder: React.Dispatch<boolean>;
}

/**
 * This component only allows drawing limit line and updating its style.
 * Only the bottom canvas can fire events, so see Chart.tsx for actions like clicks and drags.
 */

export default function LimitLineChart(props: propsIF) {
    const {
        scaleData,
        isDenomBase,
        period,
        lineSellColor,
        lineBuyColor,
        isUserConnected,
        setLimit,
        poolPriceDisplay,
        sellOrderStyle,
        checkLimitOrder,
        setCheckLimitOrder,
        limit,
    } = props;

    const d3CanvasLimitLine = useRef<HTMLCanvasElement | null>(null);

    const location = useLocation();

    const tradeData = useAppSelector((state) => state.tradeData);

    const { pool } = useContext(PoolContext);

    const [limitLine, setLimitLine] = useState<any>();
    const [triangleLimit, setTriangleLimit] = useState<any>();

    /**
     *  This effect handles the configuration and setup of limitline and triangleLimit
     */
    useEffect(() => {
        if (scaleData !== undefined) {
            const limitLine = d3fc
                .annotationCanvasLine()
                .value((d: number) => d)
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale);

            // decorate : styles the limitline
            limitLine.decorate((context: any) => {
                context.strokeStyle = 'rgba(235, 235, 255)';
                context.pointerEvents = 'none';
                context.lineWidth = 1.5;
                context.fillStyle = 'transparent';
            });

            const triangleLimit = createTriangle(
                scaleData?.xScale,
                scaleData?.yScale,
            );

            setTriangleLimit(() => {
                return triangleLimit;
            });

            setLimitLine(() => {
                return limitLine;
            });
        }
    }, [scaleData, lineSellColor, lineBuyColor, isUserConnected]);

    /**
     * This useEffect block handles the drawing  of limit lines and triangle markers on the canvas
     * when the location pathname includes '/limit'. It sets up the canvas and updates the line dash style.
     */
    useEffect(() => {
        if (location.pathname.includes('/limit')) {
            const canvas = d3
                .select(d3CanvasLimitLine.current)
                .select('canvas')
                .node() as HTMLCanvasElement;
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

            if (limitLine) {
                d3.select(d3CanvasLimitLine.current)
                    .on('draw', () => {
                        if (location.pathname.includes('/limit')) {
                            // Set canvas resolution and line dash style
                            setCanvasResolution(canvas);
                            ctx.setLineDash([20, 18]);

                            // Draw the limit line and triangle markers
                            limitLine([limit]);
                            triangleLimit([limit]);
                        }
                    })
                    .on('measure', () => {
                        // Set line dash style and rendering context for limitLine and triangleLimit
                        ctx.setLineDash([20, 18]);
                        limitLine.context(ctx);
                        triangleLimit.context(ctx);
                    });
            }
        }
    }, [limit, limitLine, location.pathname]);

    /**
     * This useEffect block checks and updates 'checkLimitOrder' based on specific conditions:
     * - It checks if 'poolPriceDisplay' is defined.
     * - It compares 'limit' with 'poolPriceDisplay' based on the 'sellOrderStyle'.
     * - It sets 'checkLimitOrder' to 'true' if 'sellOrderStyle' is 'order_sell' and 'limit' is greater than 'poolPriceDisplay',
     *   or sets it to 'true' if 'sellOrderStyle' is not 'order_sell' and 'limit' is less than 'poolPriceDisplay'
     *
     *  line color changes according to check limit order
     */
    useEffect(() => {
        if (poolPriceDisplay) {
            setCheckLimitOrder(
                sellOrderStyle === 'order_sell'
                    ? limit > poolPriceDisplay
                    : limit < poolPriceDisplay,
            );
        }
    }, [limit, sellOrderStyle, poolPriceDisplay]);

    /**
     * This useEffect block sets the color and styles for the 'triangleLimit' and 'limitLine' elements based on certain conditions.
     * It rotates and decorates the 'triangleLimit' element with the specified color.
     * It decorates the 'limitLine' element with the specified color, line width, and pointer events.
     * Finally, it renders the canvas elements.
     */
    useEffect(() => {
        if (triangleLimit !== undefined) {
            let color = 'rgba(235, 235, 255)';

            triangleLimit.decorate((context: any) => {
                if (location.pathname.includes('/limit')) {
                    if (checkLimitOrder) {
                        color =
                            sellOrderStyle === 'order_sell'
                                ? lineSellColor
                                : lineBuyColor;
                    }
                }
                const rotateDegree = 90;
                context.rotate((rotateDegree * Math.PI) / 180);
                context.strokeStyle = color;
                context.fillStyle = color;
            });
        }

        if (limitLine !== undefined && location.pathname.includes('/limit')) {
            limitLine.decorate((context: any) => {
                context.strokeStyle = checkLimitOrder
                    ? sellOrderStyle === 'order_sell'
                        ? lineSellColor
                        : lineBuyColor
                    : 'rgba(235, 235, 255)';
                context.pointerEvents = 'none';
                context.lineWidth = 1.5;
                context.fillStyle = 'transparent';
            });
        }

        renderCanvasArray([d3CanvasLimitLine]);
    }, [
        limitLine,
        triangleLimit,
        checkLimitOrder,
        sellOrderStyle,
        location.pathname,
    ]);

    useEffect(() => {
        renderCanvasArray([d3CanvasLimitLine]);
    }, [limit]);

    useEffect(() => {
        d3.select(d3CanvasLimitLine.current)
            .select('canvas')
            .style(
                'display',
                location.pathname.includes('/limit') ? 'inline' : 'none',
            );
    }, [location, location.pathname, period]);

    useEffect(() => {
        setLimitLineValue();
    }, [location, tradeData.limitTick, isDenomBase]);

    const setLimitLineValue = () => {
        if (
            tradeData.limitTick === undefined ||
            Array.isArray(tradeData.limitTick) ||
            isNaN(tradeData.limitTick)
        )
            return;
        const limitDisplayPrice = pool?.toDisplayPrice(
            tickToPrice(tradeData.limitTick),
        );
        limitDisplayPrice?.then((limit) => {
            setLimit(() => {
                return isDenomBase ? limit : 1 / limit || 0;
            });
        });
    };

    return (
        <d3fc-canvas
            ref={d3CanvasLimitLine}
            className='limit-line-canvas'
            id='limit-line-canvas'
        ></d3fc-canvas>
    );
}
