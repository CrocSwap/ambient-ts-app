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

    type toggleableColors = (typeof cssVariables.colors)[number];

    const [activeProperty, setActiveProperty] = useState<[toggleableColors, string]|null>(null);
    function updateProperty(p: toggleableColors): void {
        const currentProperty: string = activeProperty
            ? activeProperty[1]
            : getCSSCustomPropertyValue(p);
        setActiveProperty([p, currentProperty]);
    }
    function updateColor(c: string): void {
        if (activeProperty) {
            setActiveProperty([activeProperty[0], c]);
        }
    }

    function getCSSCustomPropertyValue (property: toggleableColors): string {
        const root = document.documentElement;
        const value = getComputedStyle(root).getPropertyValue(property).trim();
        return value || '';
    };

    function handleColorButtonClick(v: toggleableColors): void {
        if (activeProperty) {
            updateProperty(v);
        } else {
            const activeColor = getCSSCustomPropertyValue(v);
            setActiveProperty([v, activeColor]);
        }
    }

    return (
        <>
            {
                cssVariables.colors.map(
                    (variable: toggleableColors) => (
                        <button
                            key={variable}
                            onClick={() => handleColorButtonClick(variable)}
                        >
                            <h6>Change {variable}</h6>
                        </button>
                    )
                )
            }
            {activeProperty && <SketchPicker
                color={activeProperty[1]}
                onChange={(color: ColorResult) => updateColor(color.hex)}
            />}
            <Swap />
        </>
    );
}