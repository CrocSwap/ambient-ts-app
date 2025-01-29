import { useEffect, useState } from 'react';
// Taken and refactored from here: https://usehooks.com/useKeyPress/

// Hook
function useKeyPress(
    targetKey: string,
    onClose?: () => void,
    target: EventTarget = window,
): boolean {
    // State for keeping track of whether key is pressed
    const [keyPressed, setKeyPressed] = useState(false);
    // If pressed key is our target key then set to true
    const downHandler: EventListener = (event: Event): void => {
        const { key } = event as KeyboardEvent;
        if (key === targetKey) {
            onClose && onClose();
            setKeyPressed(true);
        }
    };

    // If released key is our target key then set to false
    const upHandler: EventListener = (event: Event): void => {
        const { key } = event as KeyboardEvent;
        if (key === targetKey) {
            setKeyPressed(false);
        }
    };

    // Add event listeners
    useEffect(() => {
        target.addEventListener('keydown', downHandler);
        target.addEventListener('keyup', upHandler);
        // Remove event listeners on cleanup
        return () => {
            target.removeEventListener('keydown', downHandler);
            target.removeEventListener('keyup', upHandler);
        };
    }, [target]); // Empty array ensures that effect is only run on mount and unmount

    return keyPressed;
}
export default useKeyPress;
