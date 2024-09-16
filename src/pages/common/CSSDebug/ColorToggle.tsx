import { useRef, useState } from 'react';
import { ColorResult, SketchPicker } from 'react-color';
import styles from './ColorToggle.module.css';
import { cssColorIF } from './CSSDebug';

interface propsIF {
    cssProperty: cssColorIF;
}

export default function ColorToggle2(props: propsIF) {
    const { cssProperty } = props;

    const [color, setColor] = useState<string>(getCssCustomPropertyValue(cssProperty.name));

    function getCssCustomPropertyValue(p: string): string {
        const root: HTMLElement = document.documentElement;
        const value: string = getComputedStyle(root).getPropertyValue(p).trim();
        return value;
    }

    function handleChange(c: string): void {
        setColor(c);
        document.documentElement.style.setProperty(cssProperty.name, c);
    }

    const originalColor = useRef(getCssCustomPropertyValue(cssProperty.name));

    return (
        <section className={styles.color_toggle}>
            <header>
                <h4>Toggle {cssProperty.name}</h4>
                <button onClick={() => handleChange(originalColor.current)}>R</button>
            </header>
            <SketchPicker
                color={color}
                onChange={(color: ColorResult) => handleChange(color.hex)}
            />
        </section>
    );
}