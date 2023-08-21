import { useContext, useState } from 'react';
import { ChartContext } from '../../../contexts/ChartContext';

export function useUndoRedo() {
    const { lineDataHistory, setLineDataHistory } = useContext(ChartContext);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [redoHistory, setRedoHistory] = useState<any>([]);

    function undo() {
        if (lineDataHistory.length > 0) {
            const lastAction = lineDataHistory[lineDataHistory.length - 1];
            setRedoHistory([...redoHistory, lastAction]);

            setLineDataHistory((prev) => prev.slice(0, -1));
        }
    }

    function redo() {
        if (redoHistory.length > 0) {
            const nextAction = redoHistory[redoHistory.length - 1];

            setRedoHistory(redoHistory.slice(0, -1));
            setLineDataHistory((prev) => [...prev, nextAction]);
        }
    }

    return { undo, redo };
}
