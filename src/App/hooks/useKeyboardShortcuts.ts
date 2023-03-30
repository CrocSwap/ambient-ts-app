import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

type KeyCombo = {
    modifierKeys: Array<'Shift' | 'Alt' | 'Control' | 'Meta'>;
    key: string;
};

const useKeyboardShortcuts = (keyCombo: KeyCombo, callback: () => void) => {
    const callbackRef = useCallback(callback, [callback]);
    const navigate = useNavigate();

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isModifierKeysPressed = keyCombo.modifierKeys.every(
                (modifierKey) => event.getModifierState(modifierKey),
            );

            if (isModifierKeysPressed && event.key === keyCombo.key) {
                callbackRef();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [keyCombo, callbackRef]);
};

// const Market = () => {
//   const navigate = useNavigate();

//   useKeyboardShortcut('M', () => {
//     navigate('/market');
//   });

//   return <div>Market Page</div>;
// };

// const Range = () => {
//   const navigate = useNavigate();

//   useKeyboardShortcut('R', () => {
//     navigate('/range');
//   });

//   return <div>Range Page</div>;
// };

// const Limit = () => {
//   const navigate = useNavigate();

//   useKeyboardShortcut('L', () => {
//     navigate('/limit');
//   });

//   return <div>Limit Page</div>;
// };

export default useKeyboardShortcuts;
