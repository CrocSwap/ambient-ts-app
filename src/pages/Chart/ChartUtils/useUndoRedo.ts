import { useState } from 'react';
import { drawDataHistory } from './chartUtils';

export function useUndoRedo(
    drawnShapeHistory: drawDataHistory[],
    setDrawnShapeHistory: React.Dispatch<
        React.SetStateAction<drawDataHistory[]>
    >,
) {
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
