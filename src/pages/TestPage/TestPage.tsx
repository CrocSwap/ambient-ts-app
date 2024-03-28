import { useContext } from 'react';
import { AppStateContext } from '../../contexts/AppStateContext';

export default function TestPage() {
    const { skin } = useContext(AppStateContext);
    return (
        <div>
            <button onClick={() => skin.changeTo('purple_dark')}>
                Purple Dark
            </button>
            <button onClick={() => skin.changeTo('orange')}>Orange</button>
        </div>
    );
}
