import { useEffect, useCallback } from 'react';

type KeyCombo = {
    modifierKeys: Array<'Shift' | 'Alt' | 'Control' | 'Meta'>;
    key: string;
};

const useKeyboardShortcuts = (keyCombo: KeyCombo, callback: () => void) => {
    const callbackRef = useCallback(callback, [callback]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isModifierKeysPressed = keyCombo.modifierKeys.every(
                (modifierKey) => event.getModifierState(modifierKey),
            );

            const focusedElementTagName = document.activeElement?.tagName;
            const isTextInputFocused =
                focusedElementTagName === 'INPUT' ||
                focusedElementTagName === 'TEXTAREA';

            if (
                !isTextInputFocused &&
                isModifierKeysPressed &&
                event.key === keyCombo.key
            ) {
                callbackRef();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [keyCombo, callbackRef]);
};

export default useKeyboardShortcuts;

// DOCUMENTATION
// useKeyboardShortcuts
// The useKeyboardShortcuts hook allows you to create keyboard shortcuts for your React application. It listens for a specific key combination, defined by a KeyCombo object, and triggers a callback function when that combination is pressed.

// Usage
// To use this hook, import it into your React component and call it with two arguments: a KeyCombo object and a callback function. The KeyCombo object specifies the key combination to listen for, and the callback function is the code that should run when that combination is pressed.

// Example usage:

// import useKeyboardShortcuts from './useKeyboardShortcuts';

// function MyComponent() {
//   useKeyboardShortcuts({ modifierKeys: ['Control'], key: 'c' }, () => {
//     console.debug('Control + c pressed');
//   });

//   return (
//     // ...
//   );
// }
// In this example, the useKeyboardShortcuts hook is called with a KeyCombo object that listens for the Control key and the c key to be pressed together. When that combination is detected, the callback function logs a message to the console.

// Arguments
// The useKeyboardShortcuts hook takes two arguments:

// keyCombo (required): A KeyCombo object that specifies the key combination to listen for. The modifierKeys property should be an array of strings representing the modifier keys (e.g. ['Shift', 'Control']) and the key property should be a string representing the non-modifier key (e.g. 'a', 'Enter').

// callback (required): A callback function that is called when the key combination is pressed.

// Return Value
// This hook does not return anything.

// Dependencies
// This hook relies on the useEffect and useCallback hooks from the react package.

// For more explanation, please feel free to reach out - Jr
