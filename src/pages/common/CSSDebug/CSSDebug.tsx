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
    const [themeName, setThemeName] = useState<string>('');
    false && themeName;

    return (
        <>
            <section
                className={styles.color_toggles}
            >
            {
                colors.map(
                    (c: cssColorIF) => (
                        <ColorToggle2
                            key={JSON.stringify(c)}
                            cssProperty={c}
                        />
                    )
                )
            }
            </section>
            <label htmlFor='theme_name'>Name this Theme:</label>
            <input
                type='text'
                name='theme_name'
                onChange={(e) => setThemeName(e.target.value.trim())}
            />
            <div>
                {`[data-theme='${themeName}']`}
            </div>
            <Swap />
        </>
    );
}
