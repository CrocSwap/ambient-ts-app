import { CHART_ANNOTATIONS_LS_KEY, drawDataHistory } from './chartUtils';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';

export interface actionKeyIF {
    poolIndex: number;
    tokenA: string;
    tokenB: string;
}

export function useUndoRedo(denomInBase: boolean) {
    const initialData = localStorage.getItem(CHART_ANNOTATIONS_LS_KEY);

    const initialArray = initialData ? JSON.parse(initialData) : [];

    const [drawnShapeHistory, setDrawnShapeHistory] =
        useState<drawDataHistory[]>(initialArray);

    const {
        chainData: { poolIndex },
    } = useContext(CrocEnvContext);

    const [drawActionStack, setDrawActionStack] = useState(
        new Map<actionKeyIF, drawDataHistory[]>(),
    );

    const [undoStack] = useState(new Map<actionKeyIF, drawDataHistory[]>());

    const currentPool = useAppSelector((state) => state.tradeData);

    const actionKey = useMemo(() => {
        const newActionKey = {
            poolIndex: poolIndex,
            tokenA: currentPool.tokenA.address,
            tokenB: currentPool.tokenB.address,
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

    useEffect(() => {
        initialArray.forEach((element: drawDataHistory) => {
            const tempData = {
                data: [
                    {
                        x: element.data[0].x,
                        y: element.data[0].y,
                        denomInBase: denomInBase,
                    },
                    {
                        x: element.data[1].x,
                        y: element.data[1].y,
                        denomInBase: denomInBase,
                    },
                ],
                type: element.type,
                time: element.time,
                pool: element.pool,
                color: element.color,
                lineWidth: element.lineWidth,
                style: element.style,
            };

            if (
                !drawActionStack.has(actionKey) &&
                actionKey.tokenA === element.pool.tokenA.address &&
                actionKey.tokenB === element.pool.tokenB.address
            ) {
                drawActionStack.set(actionKey, [tempData]);
            } else {
                const actionList = drawActionStack
                    .get(actionKey)
                    ?.find((item) => item.time === element.time);
                if (actionList === undefined) {
                    drawActionStack.get(actionKey)?.push(tempData);
                }
            }
        });
    }, []);

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
                            denomInBase: denomInBase,
                        },
                        {
                            x: 0,
                            y: 0,
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
        console.log('undo', drawActionStack);

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
        const tempDta = {
            data: [
                {
                    x: tempLastData.data[0].x,
                    y: tempLastData.data[0].y,
                    denomInBase: tempLastData.data[0].denomInBase,
                },
                {
                    x: tempLastData.data[1].x,
                    y: tempLastData.data[1].y,
                    denomInBase: tempLastData.data[0].denomInBase,
                },
            ],
            type: tempLastData.type,
            time: tempLastData.time,
            pool: tempLastData.pool,
            color: tempLastData.color,
            lineWidth: tempLastData.lineWidth,
            style: tempLastData.style,
        };

        setDrawActionStack((prevStack) => {
            const tempMap = new Map<actionKeyIF, drawDataHistory[]>(prevStack);
            const values = tempMap.get(actionKey);
            if (values) {
                const checkData =
                    JSON.stringify(values[values.length - 1]) !==
                    JSON.stringify(tempDta);
                if (checkData) values.push(tempDta);
                tempMap.set(actionKey, values);
            }
            return tempMap;
        });
    }

    useEffect(() => {
        const newShapeData = drawnShapeHistory[drawnShapeHistory.length - 1];

        if (newShapeData && initialArray !== drawnShapeHistory) {
            const newLineData = newShapeData.data;

            if (!drawActionStack.has(actionKey)) {
                drawActionStack.set(actionKey, [
                    {
                        data: [
                            {
                                x: newLineData[0].x,
                                y: newLineData[0].y,
                                denomInBase: denomInBase,
                            },
                            {
                                x: newLineData[1].x,
                                y: newLineData[1].y,
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
                                denomInBase: denomInBase,
                            },
                            {
                                x: newLineData[1].x,
                                y: newLineData[1].y,
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
        undoStack,
    };
}
