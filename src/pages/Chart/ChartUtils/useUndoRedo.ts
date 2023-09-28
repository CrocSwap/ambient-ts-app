import { drawDataHistory } from './chartUtils';
import { useContext, useMemo, useState } from 'react';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';

export interface actionKeyIF {
    poolIndex: number;
    tokenA: TokenIF;
    tokenB: TokenIF;
}

export function useUndoRedo(denomInBase: boolean) {
    const [drawnShapeHistory, setDrawnShapeHistory] = useState<
        drawDataHistory[]
    >([]);

    const {
        chainData: { poolIndex },
    } = useContext(CrocEnvContext);

    const [drawActionStack] = useState(
        new Map<actionKeyIF, drawDataHistory[]>(),
    );

    const [undoStack, setUndoStack] = useState<drawDataHistory[]>([]);

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
                };
                drawActionStack.get(actionKey)?.push(tempHistoryData);
            }
        }
        undoStack.push(item);
    }
    function undo() {
        const actionList = drawActionStack.get(actionKey);

        if (actionList) {
            const action = actionList.pop();
            const index = drawnShapeHistory.findIndex(
                (element) => element.time === action?.time,
            );

            if (action) {
                const hasSameTimeAction =
                    actionList.find((item) => item.time === action.time) ===
                    undefined;
                undoStack.push(action);
                if (index !== -1) {
                    setDrawnShapeHistory((prevHistory) => {
                        if (hasSameTimeAction) {
                            return prevHistory.filter(
                                (item: drawDataHistory) =>
                                    item.time !== action.time,
                            );
                        }

                        const lastStatusDrawnShape = actionList.filter(
                            (item: drawDataHistory) =>
                                item.time === action.time,
                        );

                        const updatedHistory = [...prevHistory];
                        updatedHistory[index] = lastStatusDrawnShape[0];

                        return updatedHistory;
                    });
                } else {
                    const lastAction = actionList.find(
                        (item) => item.time === action.time,
                    );
                    if (lastAction) {
                        setDrawnShapeHistory((prevHistory) => [
                            ...prevHistory,
                            lastAction,
                        ]);
                    }
                }
            }
        }
    }

    function redo() {
        if (drawActionStack.has(actionKey)) {
            if (undoStack.length > 0) {
                drawActionStack
                    .get(actionKey)
                    ?.push(undoStack[undoStack.length - 1]);
                const index = drawnShapeHistory.findIndex(
                    (element) =>
                        element.time === undoStack[undoStack.length - 1].time,
                );

                setDrawnShapeHistory((prevHistory) => {
                    const updatedHistory = [...prevHistory];
                    if (index !== -1) {
                        updatedHistory[index] = undoStack[undoStack.length - 1];
                        return updatedHistory;
                    }

                    return [...prevHistory, undoStack[undoStack.length - 1]];
                });
                setUndoStack((i) =>
                    i.filter((i) => i !== undoStack[undoStack.length - 1]),
                );
            }
        }
    }

    // useEffect(() => {
    //     console.log({ drawnShapeHistory }, drawActionStack);
    // }, [drawnShapeHistory]);

    return {
        undo,
        redo,
        deleteItem,
        currentPool,
        drawnShapeHistory,
        setDrawnShapeHistory,
        drawActionStack,
        actionKey,
    };
}
