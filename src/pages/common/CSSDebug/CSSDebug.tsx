import { useState } from 'react';
import { SketchPicker } from 'react-color';
import Swap from '../../platformAmbient/Swap/Swap';

export default function CSSDebug() {
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
    const [text1Color, setText1Color] = useState<string>(getCSSCustomPropertyValue('--text1'));
    function toggleColorPicker(): void {
        setShowColorPicker(!showColorPicker);
    }
    function setCSSCustomPropertyValue (property: string, color: string): void {
        const root = document.documentElement;
        setText1Color(color);
        root.style.setProperty(property, color);
    }
    function getCSSCustomPropertyValue (property: string): string {
        const root = document.documentElement;
        const value = getComputedStyle(root).getPropertyValue(property).trim();
        return value || '';
    };

    return (
        <>
            <button onClick={() => setCSSCustomPropertyValue('--text1', 'green')}>Green!</button>
            <button onClick={() => toggleColorPicker()}>Show Picker</button>
            {showColorPicker && <SketchPicker
                color={text1Color}
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
                onChange={(color) => setCSSCustomPropertyValue('--text1', 'green')}
                // onChange={(color) => setCSSCustomPropertyValue('--text1', color)}
            />}
            <Swap />
        </>
    );
}