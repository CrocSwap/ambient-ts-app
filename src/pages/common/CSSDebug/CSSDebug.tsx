import { useState } from 'react';
import Swap from '../../platformAmbient/Swap/Swap';
import styles from './CSSDebug.module.css';
import ColorToggle2 from './ColorToggle';

const colors = [
    { name: '--text1', format: 'text' },
    { name: '--text2', format: 'text' },
    { name: '--text3', format: 'text' },
    { name: '--dark1', format: 'background' },
    { name: '--dark2', format: 'background' },
    { name: '--dark3', format: 'background' },
    { name: '--dark4', format: 'background' },
    { name: '--accent1', format: 'text' },
    { name: '--accent2', format: 'text' },
    { name: '--accent3', format: 'text' },
    { name: '--accent4', format: 'text' },
    { name: '--accent5', format: 'text' },
    { name: '--positive', format: 'text' },
    { name: '--negative', format: 'text' },
    { name: '--other-green', format: 'text' },
    { name: '--other-red', format: 'text' },
    { name: '--border', format: 'border' },
    { name: '--dark-border-color', format: 'border' },
];

export interface cssColorIF {
    name: typeof colors[number]['name'];
    format: string;
}

export default function CSSDebug() {
    // const [themeName, setThemeName] = useState<string>('');

    const SAMPLE_TEXT = 'Zero-to-One Decentralized Trading Protocol';
    const [sampleText, setSampleText] = useState<string>(SAMPLE_TEXT);

    return (
        <>
            <section className={styles.css_debug}>
                <div className={styles.color_toggles}>{
                        colors.map(
                            (c: cssColorIF) => (
                                <ColorToggle2
                                    key={JSON.stringify(c)}
                                    cssProperty={c}
                                />
                            )
                        )
                    }
                </div>
                <div>
                <input
                    type='text'
                    value={sampleText}
                    onChange={
                        (e) => setSampleText(e.target.value)
                    }
                />
                </div>
            </section>
            <Swap />
        </>
    );
}
