import { useState } from 'react';
import { SketchPicker } from 'react-color';
import Swap from '../../platformAmbient/Swap/Swap';

export default function CSSDebug() {
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
    function toggleColorPicker(): void {
        setShowColorPicker(!showColorPicker);
    }
    function getCSSCustomPropertyValue (property: string): string {
        const root = document.documentElement;
        const value = getComputedStyle(root).getPropertyValue(property).trim();
        return value || '';
    };

    return (
        <>
            <button onClick={() => document.documentElement.style.setProperty('--text1', 'green')}>Green!</button>
            <button onClick={() => toggleColorPicker()}>Show Picker</button>
            {showColorPicker && <SketchPicker
                color={getCSSCustomPropertyValue('--text1')}
                // width={'170px'}
                // onChange={(
                //     color,
                //     event,
                // ) => {
                //     event.stopPropagation();
                //     item.action(
                //         selectedColorObj.replaceSelector,
                //         color,
                //     );
                // }}
            />}
            <Swap />
        </>
    );
}