import { useContext, useEffect, useRef, useState } from 'react';

import * as d3 from 'd3';
import * as d3fc from 'd3fc';
import { lineValue, renderCanvasArray, setCanvasResolution } from '../Chart';
import { createTriangle } from '../ChartUtils/triangle';
import { diffHashSigScaleData } from '../../../utils/functions/diffHashSig';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { tickToPrice } from '@crocswap-libs/sdk';
import { PoolContext } from '../../../contexts/PoolContext';

interface propsIF {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    scaleData: any;
    isDenomBase: boolean;
    period: number;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    setLimit: any;
    limit: lineValue[];
    lineSellColor: string;
    lineBuyColor: string;
    isUserConnected: boolean | undefined;
    poolPriceDisplay: number;
    sellOrderStyle: string;
    checkLimitOrder: boolean;
    setCheckLimitOrder: React.Dispatch<boolean>;
}

export default function LimitLineCanvas(props: propsIF) {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [triangleLimit, setTriangleLimit] = useState<any>();

    useEffect(() => {
        if (scaleData !== undefined) {
            const limitLine = d3fc
                .annotationCanvasLine()
                .value((d: any) => d.value)
                .xScale(scaleData?.xScale)
                .yScale(scaleData?.yScale);

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
    }, [
        // diffHashSigScaleData(scaleData),
        lineSellColor,
        lineBuyColor,
        isUserConnected,
    ]);

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
                            setCanvasResolution(canvas);
                            ctx.setLineDash([20, 18]);
                            limitLine(limit);
                            triangleLimit(limit);
                        }
                    })
                    .on('measure', () => {
                        ctx.setLineDash([20, 18]);
                        limitLine.context(ctx);
                        triangleLimit.context(ctx);
                    });
            }
        }
    }, [limit, limitLine, location.pathname]);

    useEffect(() => {
        if (poolPriceDisplay) {
            setCheckLimitOrder(
                sellOrderStyle === 'order_sell'
                    ? limit[0].value > poolPriceDisplay
                    : limit[0].value < poolPriceDisplay,
            );
        }
    }, [limit, sellOrderStyle, poolPriceDisplay]);

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

            // renderCanvasArray([d3CanvasLimitLine]);
        }
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
            setLimit([
                {
                    name: 'Limit',
                    value: isDenomBase ? limit : 1 / limit || 0,
                },
            ]);
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
