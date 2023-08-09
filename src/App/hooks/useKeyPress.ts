import { useState, useEffect } from 'react';
// Taken and refactored from here: https://usehooks.com/useKeyPress/

// Hook
function useKeyPress(targetKey: string, onClose?: () => void): boolean {
    // State for keeping track of whether key is pressed
    const [keyPressed, setKeyPressed] = useState(false);
    // If pressed key is our target key then set to true
    function downHandler({ key }: KeyboardEvent): void {
        if (key === targetKey) {
            onClose && onClose();
            setKeyPressed(true);
        }
    }
    // If released key is our target key then set to false
    function upHandler({ key }: KeyboardEvent): void {
        if (key === targetKey) {
            setKeyPressed(false);
        }
    }
    // Add event listeners
    useEffect(() => {
        window.addEventListener('keydown', downHandler);
        window.addEventListener('keyup', upHandler);
        // Remove event listeners on cleanup
        return () => {
            window.removeEventListener('keydown', downHandler);
            window.removeEventListener('keyup', upHandler);
        };
    }, []); // Empty array ensures that effect is only run on mount and unmount

    return keyPressed;
}
export default useKeyPress;
