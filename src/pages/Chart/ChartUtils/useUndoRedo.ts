import { drawDataHistory } from './chartUtils';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';

interface actionKeyIF {
    poolIndex: number;
    tokenA: TokenIF;
    tokenB: TokenIF;
}

export function useUndoRedo() {
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
        return {
            poolIndex: poolIndex,
            tokenA: currentPool.tokenA,
            tokenB: currentPool.tokenB,
        };
    }, [poolIndex, currentPool]);

    function deleteItem(item: any) {
        const actionList = drawActionStack.get(actionKey);
        if (actionList) {
            const filteredList = actionList.find((i) => i.data === item);

            if (filteredList) {
                // filteredList null veya undefined değilse, data özelliğine değer atayabilirsiniz
                filteredList.data = [
                    { x: 0, y: 0, ctx: item.ctx },
                    { x: 0, y: 0, ctx: item.ctx },
                ];
            }
        }

        undoStack.push(item);
    }
    function undo() {
        if (drawnShapeHistory.length > 0) {
            const actionList = drawActionStack.get(actionKey);

            if (actionList) {
                const action = actionList.pop();

                const index = drawnShapeHistory.findIndex(
                    (element) => element.time === action?.time,
                );

                if (action) {
                    undoStack.push(action);
                    if (index !== -1) {
                        setDrawnShapeHistory((prevHistory) => {
                            const updatedHistory = [...prevHistory];
                            updatedHistory[index] = action;
                            return updatedHistory;
                        });
                    } else {
                        setDrawnShapeHistory((prev) =>
                            prev.filter((_item, _index) => {
                                return _item.time !== undoStack[0].time;
                            }),
                        );
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

                if (index) {
                    setDrawnShapeHistory((prevHistory) => {
                        const updatedHistory = [...prevHistory];
                        updatedHistory[index] = undoStack[undoStack.length - 1];
                        return updatedHistory;
                    });
                }

                setUndoStack((i) =>
                    i.filter((i) => i !== undoStack[undoStack.length - 1]),
                );
            }
        }
    }

    useEffect(() => {
        console.log({ drawActionStack });
    }, [drawActionStack.size]);

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
