import { drawDataHistory } from './chartUtils';
import { useContext, useMemo, useState } from 'react';
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

    const currentPool = useAppSelector((state) => state.tradeData);

    const actionKey = useMemo(() => {
        return {
            poolIndex: poolIndex,
            tokenA: currentPool.tokenA,
            tokenB: currentPool.tokenB,
        };
    }, [poolIndex, currentPool]);

    function undo() {
        if (drawnShapeHistory.length > 0) {
            const firstIndexOfSelected = drawnShapeHistory.findLastIndex(
                (element) =>
                    element.pool.quoteToken === currentPool.quoteToken &&
                    element.pool.baseToken === currentPool.baseToken,
            );

            const lastAction = drawnShapeHistory[firstIndexOfSelected];

            if (!drawActionStack.has(actionKey)) {
                drawActionStack.set(actionKey, [lastAction]);
            } else {
                drawActionStack.get(actionKey)?.push(lastAction);
            }

            setDrawnShapeHistory((prev) =>
                prev.filter((_item, index) => {
                    return index !== firstIndexOfSelected;
                }),
            );
        }
    }
    function redo() {
        if (drawActionStack.has(actionKey)) {
            const actionList = drawActionStack.get(actionKey);

            if (actionList && actionList.length > 0) {
                const action = actionList.pop();
                if (action) {
                    setDrawnShapeHistory((prev) => [...prev, ...[action]]);
                }
            }
        }
    }

    return { undo, redo, currentPool, drawnShapeHistory, setDrawnShapeHistory };
}
