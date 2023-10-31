import { drawDataHistory } from './chartUtils';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';

export interface actionKeyIF {
    poolIndex: number;
    tokenA: TokenIF;
    tokenB: TokenIF;
}

export function useUndoRedo(denomInBase: boolean) {
    const initialData = localStorage.getItem('draw_shapes');

    const initialArray = initialData ? JSON.parse(initialData) : [];

    const [drawnShapeHistory, setDrawnShapeHistory] =
        useState<drawDataHistory[]>(initialArray);

    const {
        chainData: { poolIndex },
    } = useContext(CrocEnvContext);

    const [drawActionStack] = useState(
        new Map<actionKeyIF, drawDataHistory[]>(),
    );

    const [undoStack] = useState(new Map<actionKeyIF, drawDataHistory[]>());

    const currentPool = useAppSelector((state) => state.tradeData);

    const actionKey = useMemo(() => {
        const newActionKey = {
            poolIndex: poolIndex,
            tokenA: currentPool.tokenA,
            tokenB: currentPool.tokenB,
        };
        let existingKey = null;

        for (const k of drawActionStack.keys()) {
            if (JSON.stringify(k) === JSON.stringify(newActionKey)) {
                existingKey = k;
                break;
            }
        }

        if (existingKey) {
            return existingKey;
        }

        return newActionKey;
    }, [poolIndex, currentPool.tokenA, currentPool.tokenB]);

    function deleteItem(item: drawDataHistory) {
        const actionList = drawActionStack.get(actionKey);
        if (actionList) {
            const findItem = actionList.find(
                (i) => JSON.stringify(i) === JSON.stringify(item),
            );

            if (findItem) {
                const tempHistoryData = {
                    data: [
                        {
                            x: 0,
                            y: 0,
                            ctx: findItem.data[0].ctx,
                            denomInBase: denomInBase,
                        },
                        {
                            x: 0,
                            y: 0,
                            ctx: findItem.data[1].ctx,
                            denomInBase: denomInBase,
                        },
                    ],
                    type: findItem.type,
                    time: findItem.time,
                    pool: findItem.pool,
                    color: '#7371fc',
                    lineWidth: 1.5,
                    style: [0, 0],
                };
                drawActionStack.get(actionKey)?.push(tempHistoryData);
            }
        }
        undoStack.get(actionKey)?.push(item);
    }
    function undo() {
        const actionList = drawActionStack.get(actionKey);

        if (actionList) {
            const action = actionList.pop();
            if (action) {
                undoDrawnShapeHistory(action);
                if (!undoStack.has(actionKey)) {
                    undoStack.set(actionKey, []);
                }
                undoStack.get(actionKey)?.push(action);
            }
        }
    }

    function redo() {
        if (drawActionStack.has(actionKey)) {
            const undoActionList = undoStack.get(actionKey);
            if (undoActionList) {
                const lastValue = undoActionList[undoActionList?.length - 1];

                if (lastValue) {
                    drawActionStack.get(actionKey)?.push(lastValue);
                    const actionList = undoStack.get(actionKey);

                    if (actionList) {
                        const action = actionList.pop();
                        if (action) {
                            redoDrawnShapeHistory(action);
                        }
                    }
                }
            }
        }
    }

    function undoDrawnShapeHistory(action: drawDataHistory) {
        const actions = drawActionStack
            .get(actionKey)
            ?.filter((item) => item.time === action.time);

        setDrawnShapeHistory((prev) => {
            if (actions && actions?.length > 0) {
                if (
                    action.data[0].x === 0 &&
                    action.data[0].y === 0 &&
                    action.data[1].x === 0 &&
                    action.data[1].y === 0
                ) {
                    return [...prev, actions[actions?.length - 1]];
                } else {
                    return prev.map((item) => {
                        if (
                            JSON.stringify(item.data) ===
                            JSON.stringify(action.data)
                        ) {
                            item = actions[actions?.length - 1];
                            return {
                                ...item,
                            };
                        }
                        return item;
                    });
                }
            } else {
                return prev.filter(
                    (item) =>
                        JSON.stringify(item.data) !==
                        JSON.stringify(action.data),
                );
            }
        });
    }

    function redoDrawnShapeHistory(action: drawDataHistory) {
        setDrawnShapeHistory((prev) => {
            const updatedHistory = prev.map((item) => {
                if (item.time === action.time) {
                    item = action;
                    return {
                        ...item,
                    };
                }
                return item;
            });

            if (!updatedHistory.some((item) => item.time === action.time)) {
                updatedHistory.push(action);
            }

            return updatedHistory;
        });
    }

    function addDrawActionStack(tempLastData: drawDataHistory) {
        drawActionStack.get(actionKey)?.push({
            data: [
                {
                    x: tempLastData.data[0].x,
                    y: tempLastData.data[0].y,
                    ctx: tempLastData.data[0].ctx,
                    denomInBase: tempLastData.data[0].denomInBase,
                },
                {
                    x: tempLastData.data[1].x,
                    y: tempLastData.data[1].y,
                    ctx: tempLastData.data[1].ctx,
                    denomInBase: tempLastData.data[0].denomInBase,
                },
            ],
            type: tempLastData.type,
            time: tempLastData.time,
            pool: tempLastData.pool,
            color: tempLastData.color,
            lineWidth: tempLastData.lineWidth,
            style: tempLastData.style,
        });
    }

    useEffect(() => {
        const newShapeData = drawnShapeHistory[drawnShapeHistory.length - 1];

        if (newShapeData) {
            const newLineData = newShapeData.data;

            if (!drawActionStack.has(actionKey)) {
                drawActionStack.set(actionKey, [
                    {
                        data: [
                            {
                                x: newLineData[0].x,
                                y: newLineData[0].y,
                                ctx: newLineData[0].ctx,
                                denomInBase: denomInBase,
                            },
                            {
                                x: newLineData[1].x,
                                y: newLineData[1].y,
                                ctx: newLineData[1].ctx,
                                denomInBase: denomInBase,
                            },
                        ],
                        type: newShapeData.type,
                        time: newShapeData.time,
                        pool: newShapeData.pool,
                        color: newShapeData.color,
                        lineWidth: newShapeData.lineWidth,
                        style: [0, 0],
                    },
                ]);
            } else {
                const actionList = drawActionStack.get(actionKey);
                const checkData = actionList?.find(
                    (item: drawDataHistory) =>
                        JSON.stringify(item) === JSON.stringify(newShapeData),
                );

                if (checkData === undefined) {
                    drawActionStack.get(actionKey)?.push({
                        data: [
                            {
                                x: newLineData[0].x,
                                y: newLineData[0].y,
                                ctx: newLineData[0].ctx,
                                denomInBase: denomInBase,
                            },
                            {
                                x: newLineData[1].x,
                                y: newLineData[1].y,
                                ctx: newLineData[1].ctx,
                                denomInBase: denomInBase,
                            },
                        ],
                        type: newShapeData.type,
                        time: newShapeData.time,
                        pool: newShapeData.pool,
                        color: newShapeData.color,
                        lineWidth: newShapeData.lineWidth,
                        style: [0, 0],
                    });

                    undoStack.clear();
                }
            }
        }
    }, [drawnShapeHistory.length]);

    return {
        undo,
        redo,
        deleteItem,
        currentPool,
        drawnShapeHistory,
        setDrawnShapeHistory,
        drawActionStack,
        actionKey,
        addDrawActionStack,
    };
}
