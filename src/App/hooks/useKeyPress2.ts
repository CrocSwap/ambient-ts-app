import { useState, useEffect } from 'react';

export function useKeyPress2(
    targetKeys: string[],
    callback: (event: KeyboardEvent) => void,
) {
    // State for keeping track of whether keys are pressed
    const [keysPressed, setKeysPressed] = useState<string[]>([]);

    // Add pressed key to array of pressed keys
    function downHandler({ key }: KeyboardEvent) {
        if (targetKeys.includes(key) && !keysPressed.includes(key)) {
            setKeysPressed((prev) => [...prev, key]);
        }
    }

    // Remove released key from array of pressed keys
    const upHandler = ({ key }: KeyboardEvent) => {
        if (targetKeys.includes(key)) {
            setKeysPressed((prev) => prev.filter((k) => k !== key));
        }
    };

    // Call callback function if target key combination is pressed
    useEffect(() => {
        if (targetKeys.every((k) => keysPressed.includes(k))) {
            window.addEventListener('keyup', callback);
            return () => {
                window.removeEventListener('keyup', callback);
            };
        }
    }, [keysPressed]);

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
}
