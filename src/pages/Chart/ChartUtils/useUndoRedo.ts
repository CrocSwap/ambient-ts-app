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
    const initialArray = initialData
        ? JSON.parse(initialData)?.drawnShapes || []
        : [];

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
                background: element.background,
                lineWidth: element.lineWidth,
                style: element.style,
            };

            if (!drawActionStack.has(actionKey)) {
                if (
                    (actionKey.tokenA === element.pool.tokenA &&
                        actionKey.tokenB === element.pool.tokenB) ||
                    (actionKey.tokenA === element.pool.tokenB &&
                        actionKey.tokenB === element.pool.tokenA)
                ) {
                    drawActionStack.set(actionKey, [tempData]);
                } else {
                    drawActionStack.set(actionKey, []);
                }
            } else {
                const actionList = drawActionStack
                    .get(actionKey)
                    ?.find((item) => item.time === element.time);
                if (
                    actionList === undefined &&
                    actionKey.tokenA === element.pool.tokenA &&
                    actionKey.tokenB === element.pool.tokenB
                ) {
                    drawActionStack.get(actionKey)?.push(tempData);
                }
            }
        });
    }, [actionKey]);

    function deleteItem(item: drawDataHistory) {
        const actionList = drawActionStack.get(actionKey);
        if (actionList) {
            const findItem = actionList.find((i) => {
                return (
                    JSON.stringify(i.data) === JSON.stringify(item.data) &&
                    i.time === item.time
                );
            });

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
                    background: '#7371fc',
                    lineWidth: 1.5,
                    style: [0, 0],
                };

                drawActionStack.get(actionKey)?.push(tempHistoryData);
            }
        }
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

                const undoStackList = undoStack.get(actionKey);

                if (undoStackList) {
                    const lastDataUndoStack =
                        undoStackList[undoStackList?.length - 1];
                    if (
                        undoStackList.length === 0 ||
                        !(
                            lastDataUndoStack.time === action.time &&
                            lastDataUndoStack.data[0].x === 0 &&
                            lastDataUndoStack.data[0].y === 0 &&
                            lastDataUndoStack.data[1].x === 0 &&
                            lastDataUndoStack.data[1].y === 0 &&
                            action.data[0].x === 0 &&
                            action.data[0].y === 0 &&
                            action.data[1].x === 0 &&
                            action.data[1].y === 0
                        )
                    ) {
                        undoStack.get(actionKey)?.push(action);
                    }
                }
            }
        }
    }

    function redo() {
        if (drawActionStack.has(actionKey)) {
            const undoActionList = undoStack.get(actionKey);
            if (undoActionList) {
                const lastValue = undoActionList[undoActionList?.length - 1];

                if (lastValue) {
                    if (undoActionList) {
                        drawActionStack.get(actionKey)?.push({
                            color: lastValue.color,
                            background: lastValue.background,
                            data: [
                                {
                                    x: lastValue.data[0].x,
                                    y: lastValue.data[0].y,
                                    denomInBase: lastValue.data[0].denomInBase,
                                },
                                {
                                    x: lastValue.data[1].x,
                                    y: lastValue.data[1].y,
                                    denomInBase: lastValue.data[0].denomInBase,
                                },
                            ],
                            lineWidth: lastValue.lineWidth,
                            pool: lastValue.pool,
                            style: lastValue.style,
                            time: lastValue.time,
                            type: lastValue.type,
                        });
                    }
                    if (undoActionList) {
                        const action = undoActionList.pop();
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
        let tempData: drawDataHistory | undefined = undefined;

        const index = drawnShapeHistory.findIndex(
            (item) => JSON.stringify(item.time) === JSON.stringify(action.time),
        );
        let lastActionData: drawDataHistory | undefined = undefined;
        if (actions && actions?.length > 0) {
            lastActionData = actions[actions?.length - 1];
            tempData = {
                data: [
                    {
                        x: lastActionData.data[0].x,
                        y: lastActionData.data[0].y,
                        denomInBase: lastActionData.data[0].denomInBase,
                    },
                    {
                        x: lastActionData.data[1].x,
                        y: lastActionData.data[1].y,
                        denomInBase: lastActionData.data[0].denomInBase,
                    },
                ],
                type: lastActionData.type,
                time: lastActionData.time,
                pool: lastActionData.pool,
                color: lastActionData.color,
                lineWidth: lastActionData.lineWidth,
                style: lastActionData.style,
            } as drawDataHistory;
        }

        setDrawnShapeHistory((prev) => {
            if (tempData) {
                if (
                    action.data[0].x === 0 &&
                    action.data[0].y === 0 &&
                    action.data[1].x === 0 &&
                    action.data[1].y === 0 &&
                    JSON.stringify(lastActionData) !== JSON.stringify(action) &&
                    index === -1
                ) {
                    return [...prev, tempData];
                } else {
                    const newDrawnShapeHistory = [...prev];
                    newDrawnShapeHistory[index] = tempData;
                    return newDrawnShapeHistory;
                }
            } else {
                const newDrawnShapeHistory = [...prev];
                return newDrawnShapeHistory.filter(
                    (item) =>
                        JSON.stringify(item.data) !==
                        JSON.stringify(action.data),
                );
            }
        });
    }

    function redoDrawnShapeHistory(action: drawDataHistory) {
        const tempData = {
            data: [
                {
                    x: action.data[0].x,
                    y: action.data[0].y,
                    denomInBase: action.data[0].denomInBase,
                },
                {
                    x: action.data[1].x,
                    y: action.data[1].y,
                    denomInBase: action.data[0].denomInBase,
                },
            ],
            type: action.type,
            time: action.time,
            pool: action.pool,
            color: action.color,
            lineWidth: action.lineWidth,
            style: action.style,
        } as drawDataHistory;

        if (
            action.data[0].x !== 0 &&
            action.data[0].y !== 0 &&
            action.data[1].x !== 0 &&
            action.data[1].y !== 0
        ) {
            const index = drawnShapeHistory.findIndex(
                (item) => item.time === action.time,
            );

            setDrawnShapeHistory((prev) => {
                const updatedHistory = [...prev];
                if (index !== -1) {
                    updatedHistory[index] = tempData;
                    return updatedHistory;
                } else {
                    return [...prev, tempData];
                }
            });
        }
    }

    function addDrawActionStack(
        tempLastData: drawDataHistory,
        isNewShape: boolean,
    ) {
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
            background: tempLastData.background,
            lineWidth: tempLastData.lineWidth,
            style: tempLastData.style,
        };

        const tempMap = new Map<actionKeyIF, drawDataHistory[]>(
            drawActionStack,
        );

        if (drawActionStack.has(actionKey)) {
            const actions = drawActionStack.get(actionKey);

            if (actions) {
                tempMap.set(actionKey, actions);

                const values = tempMap.get(actionKey);
                if (values) {
                    if (actions) {
                        actions.push(tempDta);
                    }
                }
            }
            setDrawActionStack(tempMap);
        } else {
            drawActionStack.set(actionKey, [tempDta]);
        }

        if (isNewShape) {
            undoStack.clear();
        }
    }

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
