import { drawDataHistory } from './chartUtils';
import { useContext, useState } from 'react';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { TradeDataIF } from '../../../utils/state/tradeDataSlice';
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

    function undo() {
        if (drawnShapeHistory.length > 0) {
            const firstIndexOfSelected = drawnShapeHistory.findLastIndex(
                (element) =>
                    element.pool.quoteToken === currentPool.quoteToken &&
                    element.pool.baseToken === currentPool.baseToken,
            );

            const lastAction = drawnShapeHistory[firstIndexOfSelected];

            if (
                !drawActionStack.has({
                    poolIndex: poolIndex,
                    tokenA: currentPool.tokenA,
                    tokenB: currentPool.tokenB,
                })
            ) {
                drawActionStack.set(
                    {
                        poolIndex: poolIndex,
                        tokenA: currentPool.tokenA,
                        tokenB: currentPool.tokenB,
                    },
                    [lastAction],
                );
            } else {
                drawActionStack
                    .get({
                        poolIndex: poolIndex,
                        tokenA: currentPool.tokenA,
                        tokenB: currentPool.tokenB,
                    })
                    ?.push(lastAction);
            }

            setDrawnShapeHistory((prev) =>
                prev.filter((_item, index) => {
                    return index !== firstIndexOfSelected;
                }),
            );
        }
    }

    function redo() {
        if (
            drawActionStack.has({
                poolIndex: poolIndex,
                tokenA: currentPool.tokenA,
                tokenB: currentPool.tokenB,
            })
        ) {
            const action = drawActionStack
                .get({
                    poolIndex: poolIndex,
                    tokenA: currentPool.tokenA,
                    tokenB: currentPool.tokenB,
                })
                ?.pop();

            if (action) {
                setDrawnShapeHistory((prev) => [...prev, action]);
            }
        }
    }

    return { undo, redo, currentPool, drawnShapeHistory, setDrawnShapeHistory };
}
