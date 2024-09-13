import { useState } from 'react';
import { SketchPicker, ColorResult } from 'react-color';
import { toggleableColors } from './CSSDebug';
import styles from './ColorToggle.module.css';

interface propsIF {
    cssProperty: toggleableColors;
}

export default function ColorToggle(props: propsIF) {
    const { cssProperty } = props;

    // current color in the selector, initializes off active value
    const [color, setColor] = useState<string>(getCSSCustomPropertyValue(cssProperty));

    function getCSSCustomPropertyValue (property: toggleableColors): string {
        const root: HTMLElement = document.documentElement;
        const value: string = getComputedStyle(root).getPropertyValue(property).trim();
        return value;
    };

    function handleChange(c: ColorResult): void {
        setColor(c.hex);
        document.documentElement.style.setProperty(cssProperty, c.hex);
    }

    return (
        <section className={styles.color_toggle}>
            <h4>Toggle {cssProperty}</h4>
            <SketchPicker
                color={color}
                onChange={((color: ColorResult) => handleChange(color))}
            />
        </section>
    );
}