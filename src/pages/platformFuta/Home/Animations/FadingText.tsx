import React, { useEffect, useState } from 'react';
import styles from './FadingText.module.css';

interface FadingTextProps {
    text: string;
    fadeInDelay?: number;
    fadeInTime?: number;
    fadeOutDelay?: number;
    fadeOutTime?: number;
    color?: string;
    fontSize?: string;
}

const FadingText: React.FC<FadingTextProps> = ({
    text,
    fadeInDelay = 0,
    fadeInTime = 1000,
    fadeOutDelay = 0,
    fadeOutTime = 1000,
    color = '#AACFD1', // Default color
    fontSize = '24px', // Default font size
}) => {
    const [isFadingIn, setIsFadingIn] = useState<boolean>(false);

    useEffect(() => {
        const fadeInTimer = setTimeout(() => {
            setIsFadingIn(true);
        }, fadeInDelay);

        const fadeOutTimer = setTimeout(
            () => {
                setIsFadingIn(false);
            },
            fadeInDelay + fadeInTime + fadeOutDelay,
        );

        return () => {
            clearTimeout(fadeInTimer);
            clearTimeout(fadeOutTimer);
        };
    }, [fadeInDelay, fadeInTime, fadeOutDelay, fadeOutTime]);

    return (
        <div
            className={styles.fadingText}
            style={{
                opacity: isFadingIn ? 1 : 0,
                transitionDuration: `${isFadingIn ? fadeInTime : fadeOutTime}ms`,
                color: color,
                fontSize: fontSize,
            }}
        >
            {text}
        </div>
    );
};

export default FadingText;
