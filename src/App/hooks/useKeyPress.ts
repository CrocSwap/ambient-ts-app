import { useState, useEffect, useCallback } from 'react';
// Taken and refactored from here: https://usehooks.com/useKeyPress/

// Hook
function useKeyPress(targetKey: string, onClose?: () => void): boolean {
    // State for keeping track of whether key is pressed
    const [keyPressed, setKeyPressed] = useState(false);

    // If pressed key is our target key then set to true
    const downHandler = useCallback(
        ({ key }: KeyboardEvent): void => {
            if (key === targetKey) {
                onClose && onClose();
                setKeyPressed(true);
            }
        },
        [onClose, targetKey],
    );

    // If released key is our target key then set to false
    const upHandler = useCallback(
        ({ key }: KeyboardEvent): void => {
            if (key === targetKey) {
                setKeyPressed(false);
            }
        },
        [targetKey],
    );

    // Add event listeners
    useEffect(() => {
        window.addEventListener('keydown', downHandler);
        window.addEventListener('keyup', upHandler);
        // Remove event listeners on cleanup
        return () => {
            window.removeEventListener('keydown', downHandler);
            window.removeEventListener('keyup', upHandler);
        };
    }, [downHandler, upHandler]);

    return keyPressed;
}
export default useKeyPress;
