import { useContext, useRef, useState } from 'react';
import { ColorResult, SketchPicker } from 'react-color';
import { RxReset } from 'react-icons/rx';
import {
    allColorsIF,
    cssColorIF,
} from '../../../ambient-utils/types/contextTypes';
import { UserPreferenceContext } from '../../../contexts';
import styles from './ColorToggle.module.css';

interface propsIF {
    cssProperty: cssColorIF;
    sampleText: string;
    allColors: allColorsIF;
}

export default function ColorToggle(props: propsIF) {
    const { cssProperty, sampleText, allColors } = props;

    const { cssDebug } = useContext(UserPreferenceContext);

    const [color, setColor] = useState<string>(
        getCssCustomPropertyValue(cssProperty.name),
    );

    function getCssCustomPropertyValue(p: string): string {
        const cached: string | undefined = cssDebug.check(p);
        const root: HTMLElement = document.documentElement;
        const value: string = getComputedStyle(root).getPropertyValue(p).trim();
        return cached ?? value;
    }

    function handleChange(c: string): void {
        cssDebug.cache(cssProperty.name, c);
        setColor(c);
        document.documentElement.style.setProperty(cssProperty.name, c);
    }

    const originalColor = useRef<string>(
        getCssCustomPropertyValue(cssProperty.name),
    );

    return (
        <section className={styles.color_toggle}>
            <div className={styles.toggle_area}>
                <header>
                    <h4>Toggle {cssProperty.name}</h4>
                    <RxReset
                        onClick={() => handleChange(originalColor.current)}
                    />
                </header>
                <SketchPicker
                    color={color}
                    onChange={(color: ColorResult) => handleChange(color.hex)}
                />
            </div>
            <div className={styles.preview_area}>
                {cssProperty.format === 'text' &&
                    allColors.background.map((c: cssColorIF) => (
                        <section
                            key={JSON.stringify(c)}
                            className={styles.text_sample}
                        >
                            <h5>On {c.name}:</h5>
                            <p
                                style={{
                                    color: color,
                                    backgroundColor: `var(${c.name})`,
                                }}
                            >
                                {sampleText}
                            </p>
                        </section>
                    ))}
                {cssProperty.format === 'background' &&
                    allColors.text.map((c: cssColorIF) => (
                        <section
                            key={JSON.stringify(c)}
                            className={styles.text_sample}
                        >
                            <h5>Under {c.name}:</h5>
                            <p
                                style={{
                                    color: `var(${c.name})`,
                                    backgroundColor: color,
                                }}
                            >
                                {sampleText}
                            </p>
                        </section>
                    ))}
            </div>
        </section>
    );
}
