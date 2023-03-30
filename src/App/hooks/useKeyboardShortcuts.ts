import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

type Shortcut = {
    combo: string;
    path: string;
};

const shortcuts: Shortcut[] = [
    { combo: 'Shift+M', path: 'trade/market' },
    { combo: 'Shift+L', path: 'trade/limit' },
    { combo: 'Shift+R', path: 'trade/range' },
    // add more shortcuts here as needed
];

type KeyCombo = {
    modifierKey: 'shiftKey' | 'altKey' | 'ctrlKey' | 'metaKey';
    key: string;
};

const useKeyboardShortcuts = (keyCombo: KeyCombo, callback: () => void) => {
    const callbackRef = useCallback(callback, [callback]);
    const navigate = useNavigate();
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event[keyCombo.modifierKey] && event.key === keyCombo.key) {
                callbackRef();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [keyCombo, callbackRef]);

    // useKeyboardShortcuts({ modifierKey: 'shiftKey', key: 'M' }, () => {
    //   navigate('trade/market');
    //  });
    //  useKeyboardShortcuts({ modifierKey: 'shiftKey', key: 'R' }, () => {
    //   navigate('trade/range');
    //  });
    //  useKeyboardShortcuts({ modifierKey: 'shiftKey', key: 'L' }, () => {
    //   navigate('trade/limit');
    //  });
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
