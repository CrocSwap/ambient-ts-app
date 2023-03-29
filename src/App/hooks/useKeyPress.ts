import { useState, useEffect } from 'react';

type KeyCombo = {
    firstKey: string;
    secondKey?: string;
};

// https://usehooks.com/useKeyPress/ : I took the useKeyPress function from this site and refactored it in typescript as well as to detect and accept multiple key press. -JR
export default function useKeyPress(keyCombo: KeyCombo): boolean {
    // State for keeping track of whether key or key combo is pressed
    const [keyPressed, setKeyPressed] = useState(false);

    // If the first and (optionally) second keys are pressed then set to true
    function downHandler({ key, shiftKey }: KeyboardEvent): void {
        const { firstKey, secondKey } = keyCombo;

        if (
            key === firstKey &&
            (!secondKey || (secondKey === 'Shift' && shiftKey))
        ) {
            setKeyPressed(true);
        }
    }

    // If the first and (optionally) second keys are released then set to false
    const upHandler = ({ key, shiftKey }: KeyboardEvent): void => {
        const { firstKey, secondKey } = keyCombo;

        if (
            key === firstKey &&
            (!secondKey || (secondKey === 'Shift' && shiftKey))
        ) {
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

// USAGE

// 1 KEY PRESS:
// import useKeyPress from './useKeyPress';

// function App() {
//   const isEnterPressed = useKeyPress('Enter');

//   return (
//     <div>
//       <h1>Press Enter</h1>
//       {isEnterPressed && <p>You pressed Enter!</p>}
//     </div>
//   );
// }

// 2 KEY PRESS:

// import useKeyPress from './useKeyPress';

// function App() {
//   const isShiftP = useKeyPress({ firstKey: 'P', secondKey: 'Shift' });

//   return (
//     <div>
//       <h1>Press Shift + P</h1>
//       {isShiftP && <p>You pressed Shift + P!</p>}
//     </div>
//   );
// }
