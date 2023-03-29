import { useState, useEffect } from 'react';

export default function useKeyPress(targetKey: string): boolean {
    // State for keeping track of whether key is pressed
    const [keyPressed, setKeyPressed] = useState(false);

    // If pressed key is our target key then set to true
    function downHandler({ key }: KeyboardEvent): void {
        if (key === targetKey) {
            setKeyPressed(true);
        }
    }

    // If released key is our target key then set to false
    const upHandler = ({ key }: KeyboardEvent): void => {
        if (key === targetKey) {
            setKeyPressed(false);
        }
    };

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

// Taken from : https://usehooks.com/useKeyPress/

// How to Use:

// The "useKeyPress" hook is a custom React hook that allows you to detect if a specific key is pressed or not.

// To use the "useKeyPress" hook, you need to pass in a target key as a string to the hook. The hook returns a boolean value which is true if the target key is currently being pressed and false if it's not being pressed.

// Example:

// import React from 'react';
// import useKeyPress from './useKeyPress';

// function MyComponent() {
//   const isKeyPressed = useKeyPress('Enter');

//   return (
//     <div>
//       {isKeyPressed ? 'Enter key is pressed' : 'Enter key is not pressed'}
//     </div>
//   );
// }
// In this example, we're using the "useKeyPress" hook to detect if the "Enter" key is currently being pressed. The hook returns a boolean value which we're using to display a message to the user.

// Note that the hook automatically adds event listeners to the window object for the "keydown" and "keyup" events. These event listeners are removed when the component unmounts.
