import React from 'react';
import styles from './WarningBox.module.css'; // Import your styles here
import { IoWarningOutline } from 'react-icons/io5';

// obj to translate human-readable color to CSS variable
const colorSets = {
    red: {
        color: 'var(--other-red)',
        background: 'var(--other-red-background)',
        border: '1px solid var(--other-red)'
    },
    orange: {
        color: 'var(--orange)',
        background: 'var(--orange-background)',
        border: '1px solid var(--orange)',
    }
};

// union type of recognized colors per `colors` obj
type warningColors = keyof typeof colorSets;

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
        color = 'red',
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
