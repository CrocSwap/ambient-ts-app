import { useRef, useState } from 'react';
import { ColorResult, SketchPicker } from 'react-color';
import styles from './ColorToggle.module.css';
import { cssColorIF } from './CSSDebug';
import { RxReset } from 'react-icons/rx';

interface propsIF {
    cssProperty: cssColorIF;
    sampleText: string;
}

export default function ColorToggle(props: propsIF) {
    const { cssProperty, sampleText } = props;

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

    function generateKey(background: string) {
        return `${cssProperty.name}_preview_over_${background}`;
    }

    return (
        <section className={styles.color_toggle}>
            <div className={styles.toggle_area}>
                <header>
                    <h4>Toggle {cssProperty.name}</h4>
                    <RxReset size={12} onClick={() => handleChange(originalColor.current)}/>
                </header>
                <SketchPicker
                    color={color}
                    onChange={(color: ColorResult) => handleChange(color.hex)}
                />
            </div>
            <div className={styles.preview_area}>
                {
                    cssProperty.format === 'text' && (
                        <>
                            {
                                ['--dark1', '--dark2', '--dark3', '--dark4'].map((
                                    (backgroundClr: string) => (
                                        <section
                                            key={generateKey(backgroundClr)}
                                            className={styles.text_sample}
                                        >
                                            <h5>On {backgroundClr}:</h5>
                                            <p style={{backgroundColor: `var(${backgroundClr})`}}>{sampleText}</p>
                                        </section>
                                    )
                                ))
                            }
                        </>
                    )
                }
            </div>
        </section>
    );
}