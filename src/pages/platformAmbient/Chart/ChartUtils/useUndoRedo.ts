import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppStateContext } from '../../../../contexts';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import { LS_KEY_CHART_ANNOTATIONS } from './chartConstants';
import { drawDataHistory, drawnShapeEditAttributes } from './chartUtils';
import { fibDefaultLevels } from './drawConstants';

export interface actionKeyIF {
    poolIndex: number;
    tokenA: string;
    tokenB: string;
}

export interface actionStackIF {
    type: string;
    time: number;
    data: Array<drawDataHistory>;
}

export function useUndoRedo(denomInBase: boolean, isTokenABase: boolean) {
    const initialData = localStorage.getItem(LS_KEY_CHART_ANNOTATIONS);
    const initialArray = initialData
        ? JSON.parse(initialData)?.drawnShapes || []
        : [];

    const [drawnShapeHistory, setDrawnShapeHistory] = useState<
        drawDataHistory[]
    >([]);

    const [currentPoolDrawnShapes, setCurrentPoolDrawnShapes] = useState<
        drawDataHistory[]
    >([]);

    const {
        activeNetwork: { poolIndex },
    } = useContext(AppStateContext);

    const [drawActionStack, setDrawActionStack] = useState(
        new Map<actionKeyIF, Array<actionStackIF>>(),
    );

    const [undoStack] = useState(new Map<actionKeyIF, Array<actionStackIF>>());

    const [isLocalStorageFetched, setIsLocalStorageFetched] = useState(false);

    const currentPool = useContext(TradeDataContext);

    const { tokenA, tokenB } = currentPool;

    useEffect(() => {
        if (
            drawnShapeHistory.length === 0 &&
            initialArray.length > 0 &&
            !isLocalStorageFetched
        ) {
            const refactoredArray: Array<drawDataHistory> = [];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            initialArray.forEach((element: any) => {
                if (
                    Object.prototype.hasOwnProperty.call(
                        element,
                        'lineWidth',
                    ) ||
                    (element.type === 'FibRetracement' &&
                        Object.prototype.hasOwnProperty.call(
                            element.extraData[0],
                            'color',
                        ))
                ) {
                    const newElement: drawDataHistory = {
                        data: element.data,
                        type: element.type,
                        time: element.time,
                        pool: element.pool,
                        extendLeft: false,
                        extendRight: false,
                        labelPlacement: 'left',
                        labelAlignment: 'center',
                        reverse: false,
                        extraData: ['FibRetracement'].includes(element.type)
                            ? structuredClone(fibDefaultLevels)
                            : [],
                        line: {
                            active: !['Rect'].includes(element.type),
                            color: 'rgba(115, 113, 252, 1)',
                            lineWidth: 1.5,
                            dash:
                                element.type === 'FibRetracement'
                                    ? [6, 6]
                                    : [0, 0],
                        } as drawnShapeEditAttributes,

                        border: {
                            active: ['Rect'].includes(element.type),
                            color: 'rgba(115, 113, 252, 1)',
                            lineWidth: 0,
                            dash: [0, 0],
                        } as drawnShapeEditAttributes,

                        background: {
                            active: ['Rect', 'DPRange'].includes(element.type),
                            color: 'rgba(115, 113, 252, 0.15)',
                            lineWidth: 1.5,
                            dash: [0, 0],
                        } as drawnShapeEditAttributes,
                    };

                    refactoredArray.push(newElement);
                }
            });

            setDrawnShapeHistory(() =>
                refactoredArray.length > 0 ? refactoredArray : initialArray,
            );
        }

        setIsLocalStorageFetched(() => {
            return true;
        });
    }, [initialData, isLocalStorageFetched]);

    useEffect(() => {
        const filteredDrawnShapeHistory = drawnShapeHistory.filter(
            (element) => {
                const isShapeInCurrentPool =
                    currentPool.tokenA.address ===
                        (isTokenABase === element.pool.isTokenABase
                            ? element.pool.tokenA
                            : element.pool.tokenB) &&
                    currentPool.tokenB.address ===
                        (isTokenABase === element.pool.isTokenABase
                            ? element.pool.tokenB
                            : element.pool.tokenA);

                return isShapeInCurrentPool;
            },
        );

        setCurrentPoolDrawnShapes(filteredDrawnShapeHistory);
    }, [drawnShapeHistory]);

    const actionKey = useMemo(() => {
        const newActionKey = {
            poolIndex: poolIndex,
            tokenA: tokenA.address,
            tokenB: tokenB.address,
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
    }, [poolIndex, tokenA, tokenB]);

    const deleteAllShapes = useCallback(() => {
        const deletedItems: drawDataHistory[] = [];

        const actionList = drawActionStack.get(actionKey);

        const filteredDrawnShapeHistory = drawnShapeHistory.filter(
            (element) => {
                const isShapeInCurrentPool =
                    currentPool.tokenA.address ===
                        (isTokenABase === element.pool.isTokenABase
                            ? element.pool.tokenA
                            : element.pool.tokenB) &&
                    currentPool.tokenB.address ===
                        (isTokenABase === element.pool.isTokenABase
                            ? element.pool.tokenB
                            : element.pool.tokenA);

                if (isShapeInCurrentPool) {
                    deletedItems.push(element);
                }
                return !isShapeInCurrentPool;
            },
        );

        if (actionList && deletedItems.length > 0) {
            const newActionStack: actionStackIF = {
                type: 'deleteAll',
                time: new Date().getTime(),
                data: deletedItems,
            };

            drawActionStack.get(actionKey)?.push(newActionStack);
        }

        setDrawnShapeHistory(filteredDrawnShapeHistory);
    }, [actionKey, drawnShapeHistory]);

    useEffect(() => {
        drawActionStack.set(actionKey, []);
    }, [actionKey]);

    const deleteItem = useCallback(
        (item: drawDataHistory) => {
            const tempHistoryData = {
                data: [
                    {
                        x: item.data[0].x,
                        y: item.data[0].y,
                        denomInBase: item.data[0].denomInBase,
                    },
                    {
                        x: item.data[1].x,
                        y: item.data[1].y,
                        denomInBase: item.data[1].denomInBase,
                    },
                ],
                type: item.type,
                time: item.time,
                pool: item.pool,
                border: item.border,
                line: item.line,
                background: item.background,
                extraData: item.extraData,
                extendLeft: item.extendLeft,
                extendRight: item.extendRight,
                labelPlacement: item.labelPlacement,
                labelAlignment: item.labelAlignment,
                reverse: item.reverse,
            };

            const newActionStack: actionStackIF = {
                type: 'delete',
                time: new Date().getTime(),
                data: [tempHistoryData],
            };

            drawActionStack.get(actionKey)?.push(newActionStack);

            if (undoStack.has(actionKey)) {
                undoStack.set(actionKey, []);
            }
        },
        [actionKey, drawActionStack, denomInBase, undoStack],
    );

    const undoDrawnShapeHistory = useCallback(
        (action: actionStackIF) => {
            let tempData: drawDataHistory | undefined = undefined;

            const index = drawnShapeHistory.findIndex(
                (item) =>
                    JSON.stringify(item.time) ===
                    JSON.stringify(action.data[0].time),
            );

            const tempDataArray: drawDataHistory[] = [];

            action.data.forEach((shapeData, index) => {
                if (action.type !== 'update' || index === 0) {
                    tempData = {
                        data: [
                            {
                                x: shapeData.data[0].x,
                                y: shapeData.data[0].y,
                                denomInBase: shapeData.data[0].denomInBase,
                            },
                            {
                                x: shapeData.data[1].x,
                                y: shapeData.data[1].y,
                                denomInBase: shapeData.data[0].denomInBase,
                            },
                        ],
                        type: shapeData.type,
                        time: shapeData.time,
                        pool: shapeData.pool,
                        border: structuredClone(shapeData.border),
                        line: structuredClone(shapeData.line),
                        background: structuredClone(shapeData.background),
                        extraData: structuredClone(shapeData.extraData),
                        extendLeft: shapeData.extendLeft,
                        extendRight: shapeData.extendRight,
                        labelPlacement: shapeData.labelPlacement,
                        labelAlignment: shapeData.labelAlignment,
                        reverse: shapeData.reverse,
                    } as drawDataHistory;

                    tempDataArray.push(tempData);
                }
            });

            setDrawnShapeHistory((prev) => {
                if (action.type !== 'create' && tempData) {
                    const shouldFill = ['delete', 'deleteAll'].includes(
                        action.type,
                    );

                    if (shouldFill && index === -1) {
                        return [...prev, ...tempDataArray];
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
                            JSON.stringify(action.data[0].data),
                    );
                }
            });
        },
        [actionKey, drawActionStack, drawnShapeHistory, setDrawnShapeHistory],
    );

    const undo = useCallback(() => {
        const actionList = drawActionStack.get(actionKey);

        if (actionList) {
            const action = actionList?.pop();

            if (action) {
                undoDrawnShapeHistory(action);

                if (!undoStack.has(actionKey)) {
                    undoStack.set(actionKey, []);
                }

                const undoStackList = undoStack.get(actionKey);

                if (undoStackList) {
                    const lastDataUndoStack =
                        undoStackList[undoStackList?.length - 1];

                    const shouldFillWithActionData = [
                        'delete',
                        'deleteAll',
                    ].includes(action.type);

                    if (
                        undoStackList?.length === 0 ||
                        !(
                            lastDataUndoStack.time === action.time &&
                            ['delete', 'deleteAll'].includes(
                                lastDataUndoStack.type,
                            ) &&
                            shouldFillWithActionData
                        )
                    ) {
                        undoStack.get(actionKey)?.push(action);
                    }
                }
            }
        }
    }, [actionKey, drawActionStack, undoDrawnShapeHistory, undoStack]);

    const redoDrawnShapeHistory = useCallback(
        (action: actionStackIF) => {
            action.data.forEach((element, i) => {
                if (action.type !== 'update' || i === 1) {
                    const tempData = {
                        data: [
                            {
                                x: element.data[0].x,
                                y: element.data[0].y,
                                denomInBase: element.data[0].denomInBase,
                            },
                            {
                                x: element.data[1].x,
                                y: element.data[1].y,
                                denomInBase: element.data[0].denomInBase,
                            },
                        ],
                        type: element.type,
                        time: element.time,
                        pool: element.pool,
                        border: structuredClone(element.border),
                        line: structuredClone(element.line),
                        background: structuredClone(element.background),
                        extraData: structuredClone(element.extraData),
                        extendLeft: element.extendLeft,
                        extendRight: element.extendRight,
                        labelPlacement: element.labelPlacement,
                        labelAlignment: element.labelAlignment,
                        reverse: element.reverse,
                    } as drawDataHistory;

                    const index = drawnShapeHistory.findIndex(
                        (item) => item.time === action.data[0].time,
                    );

                    setDrawnShapeHistory((prev) => {
                        const updatedHistory = [...prev];

                        const shouldDelete = ['delete', 'deleteAll'].includes(
                            action.type,
                        );

                        if (shouldDelete) {
                            updatedHistory.splice(index, index + 1);
                            return updatedHistory;
                        } else {
                            if (index !== -1) {
                                updatedHistory[index] = tempData;
                                return updatedHistory;
                            } else {
                                return [...prev, tempData];
                            }
                        }
                    });
                }
            });
        },
        [drawnShapeHistory, setDrawnShapeHistory],
    );

    const redo = useCallback(() => {
        if (drawActionStack.has(actionKey)) {
            const undoActionList = undoStack.get(actionKey);

            if (undoActionList) {
                const lastValue = undoActionList[undoActionList?.length - 1];

                if (lastValue) {
                    drawActionStack
                        .get(actionKey)
                        ?.push(structuredClone(lastValue));

                    const action = undoActionList.pop();
                    if (action) {
                        redoDrawnShapeHistory(action);
                    }
                }
            }
        }
    }, [actionKey, drawActionStack, undoStack, redoDrawnShapeHistory]);

    const addDrawActionStack = useCallback(
        (
            tempLastData: drawDataHistory,
            isNewShape: boolean,
            type: string,
            updatedData: drawDataHistory | undefined = undefined,
        ) => {
            const tempDta = [
                {
                    data: structuredClone(tempLastData.data),
                    type: tempLastData.type,
                    time: tempLastData.time,
                    pool: tempLastData.pool,
                    border: structuredClone(tempLastData.border),
                    line: structuredClone(tempLastData.line),
                    background: structuredClone(tempLastData.background),
                    extraData: structuredClone(tempLastData.extraData),
                    extendLeft: tempLastData.extendLeft,
                    extendRight: tempLastData.extendRight,
                    labelPlacement: tempLastData.labelPlacement,
                    labelAlignment: tempLastData.labelAlignment,
                    reverse: tempLastData.reverse,
                },
            ];

            if (type === 'update' && updatedData) {
                tempDta.push({
                    data: structuredClone(updatedData.data),
                    type: updatedData.type,
                    time: updatedData.time,
                    pool: updatedData.pool,
                    border: structuredClone(updatedData.border),
                    line: structuredClone(updatedData.line),
                    background: structuredClone(updatedData.background),
                    extraData: structuredClone(updatedData.extraData),
                    extendLeft: updatedData.extendLeft,
                    extendRight: updatedData.extendRight,
                    labelPlacement: updatedData.labelPlacement,
                    labelAlignment: updatedData.labelAlignment,
                    reverse: updatedData.reverse,
                });
            }

            const tempMap = new Map<actionKeyIF, actionStackIF[]>(
                drawActionStack,
            );

            if (drawActionStack.has(actionKey)) {
                const actions = drawActionStack.get(actionKey);

                if (actions) {
                    tempMap.set(actionKey, actions);

                    const values = tempMap.get(actionKey);
                    if (values) {
                        if (actions) {
                            const newActionStack: actionStackIF = {
                                type: type,
                                time: new Date().getTime(),
                                data: tempDta,
                            };

                            actions?.push(newActionStack);
                        }
                    }
                }
                setDrawActionStack(tempMap);
            } else {
                const newActionStack: actionStackIF = {
                    type: type,
                    time: new Date().getTime(),
                    data: tempDta,
                };

                drawActionStack.set(actionKey, [newActionStack]);
            }

            if (isNewShape) {
                undoStack.clear();
            }
        },
        [actionKey, drawActionStack, setDrawActionStack, undoStack],
    );

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
        deleteAllShapes,
        currentPoolDrawnShapes,
    };
}
