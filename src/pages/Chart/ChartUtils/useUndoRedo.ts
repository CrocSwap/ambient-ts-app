import { useContext, useState } from 'react';
import { ChartContext } from '../../../contexts/ChartContext';

export function useUndoRedo() {
    const { drawnShapeHistory, setDrawnShapeHistory } =
        useContext(ChartContext);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [redoHistory, setRedoHistory] = useState<any>([]);

    function undo() {
        if (drawnShapeHistory.length > 0) {
            const lastAction = drawnShapeHistory[drawnShapeHistory.length - 1];
            setRedoHistory([...redoHistory, lastAction]);

            setDrawnShapeHistory((prev) => prev.slice(0, -1));
        }
    }

    function redo() {
        if (redoHistory.length > 0) {
            const nextAction = redoHistory[redoHistory.length - 1];

            setRedoHistory(redoHistory.slice(0, -1));
            setDrawnShapeHistory((prev) => [...prev, nextAction]);
        }
    }

    return { undo, redo };
}
