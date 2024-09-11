import { useState } from 'react';
import { ColorResult, SketchPicker } from 'react-color';
import Swap from '../../platformAmbient/Swap/Swap';

export default function CSSDebug() {
    const cssVariables = {
        colors: [
            '--blur-bg',
            '--text1',
            '--text2',
            '--text3',
            '--dark1',
            '--dark2',
            '--dark3',
            '--dark4',
            '--accent1',
            '--accent2',
            '--accent3',
            '--accent4',
            '--accent5',
            '--positive',
            '--negative',
            '--other-green',
            '--other-red',
            '--border',
            '--dark-border-color',
        ],
    };

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
            {/* <button onClick={() => toggleColorPicker()}>
                Show Picker
                <div
                    style={{width: '20px', height: '20px', backgroundColor: text1Color, display: 'inline-block'}}
                />
            </button> */}
            {
                cssVariables.colors.map(
                    (c: (typeof cssVariables.colors)[number]) => (
                        <button
                            key={c}
                            onClick={() => toggleColorPicker()}
                        >
                            <h6>Change {c}</h6>
                        </button>
                    )
                )
            }
            {showColorPicker && <SketchPicker
                color={text1Color}
                onChange={(color: ColorResult) => {
                    console.log(color.rgb);
                    setCSSCustomPropertyValue('--text1', color.hex);
                }}
            />}
            <Swap />
        </>
    );
}