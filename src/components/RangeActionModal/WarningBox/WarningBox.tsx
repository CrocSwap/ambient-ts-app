import React from 'react';
import styles from './WarningBox.module.css'; // Import your styles here
import { IoWarningOutline } from 'react-icons/io5';

type dashedString = `--${string}`;
type cssVariable = `var(${dashedString})`;

// interface for obj with custom CSS properties and their values
interface ColorSetIF {
    color: cssVariable;
    background: cssVariable;
    border: `${number}px solid ${cssVariable}`;
}

// class constructor to make color set creation more readable
class ColorSet implements ColorSetIF {
    public readonly color: cssVariable;
    public readonly background: cssVariable;
    public readonly border: `1px solid ${cssVariable}`;
    constructor(
        col: dashedString,
        bck: dashedString,
        bor: dashedString,
    ) {
        this.color = `var(${col})`;
        this.background = `var(${bck})`;
        this.border = `1px solid var(${bor})`;
    }
}

// obj to translate human-readable color to CSS variable
const colorSets = {
    red: new ColorSet('--other-red', '--other-red-background', '--other-red'),
    orange: new ColorSet('--orange', '--orange-background', '--orange'),
    yellow: new ColorSet('--yellow', '--yellow-background', '--yellow'),
};

// union type of recognized colors per `colors` obj
type warningColors = keyof typeof colorSets;

// color set to consume by default if none is specified
const DEFAULT_COLOR_SET: warningColors = 'red';

interface propsIF {
    title?: string;
    details: React.ReactNode;
    button?: React.ReactNode;
    noBackground?: boolean;
    color?: warningColors;
}

export default function WarningBox(props: propsIF) {
    const {
        title,
        details,
        button,
        noBackground,
        color = DEFAULT_COLOR_SET,
    } = props;

    const noBackgroundWarning = (
        <div className={styles.text_only}>
            <div>
                <IoWarningOutline color={colorSets[color].color} size={24} />
            </div>
            <p>{details}</p>
            {button && button}
        </div>
    );

    if (noBackground) return noBackgroundWarning;
    return (
        <div
            className={styles.warning_box}
            style={ colorSets[color] }
        >
            <ul>
                {title && (
                    <div>
                        <IoWarningOutline
                            color={colorSets[color].color}
                            size={20}
                            style={{ marginRight: '4px' }}
                        />
                        {title}
                    </div>
                )}
                <p>{details}</p>
            </ul>
            {button && button}
        </div>
    );
}
