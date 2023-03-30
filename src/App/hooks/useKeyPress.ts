import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

type KeyCombo = {
    key: string;
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
};

const useKeyPress = (
    keyCombos: KeyCombo[],
    callback: (event: KeyboardEvent) => void,
    node: HTMLElement | null = null,
): void => {
    // implement the callback ref pattern
    const callbackRef = useRef(callback);
    useLayoutEffect(() => {
        callbackRef.current = callback;
    });

    // handle what happens on key press
    const handleKeyPress = useCallback(
        (event: KeyboardEvent) => {
            // check if the event matches any of the key combos
            if (
                keyCombos.some(
                    (combo) =>
                        combo.key === event.key &&
                        combo.ctrlKey === event.ctrlKey &&
                        combo.altKey === event.altKey &&
                        combo.shiftKey === event.shiftKey &&
                        combo.metaKey === event.metaKey,
                )
            ) {
                callbackRef.current(event);
            }
        },
        [keyCombos],
    );

    useEffect(() => {
        // target is either the provided node or the document
        const targetNode = node ?? document;
        // attach the event listener
        targetNode &&
            targetNode.addEventListener(
                'keydown',
                handleKeyPress as EventListener,
            );

        // remove the event listener
        return () =>
            targetNode &&
            targetNode.removeEventListener(
                'keydown',
                handleKeyPress as EventListener,
            );
    }, [handleKeyPress, node]);
};

export default useKeyPress;
