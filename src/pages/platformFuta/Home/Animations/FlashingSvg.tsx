import React, { useState, useEffect, CSSProperties } from 'react';
import styles from './Animations.module.css';
import logo from '../../../../assets/futa/home/FutaLogo.svg';

interface Props {
    customWidth?: string;
}
export default function FlashingSvg(props: Props) {
    const { customWidth } = props;
    const [visible, setVisible] = useState<boolean>(false);
    const [flash, setFlash] = useState<boolean>(false);

    const delay = 0; // Initial delay before flashing starts
    const flashTime = 1000; // Flash time duration
    const scaleFactor = 1.5; // Scale factor for the SVG

    useEffect(() => {
        const timer = setTimeout(() => {
            setFlash(true);
            const flashInterval = setInterval(() => {
                setVisible((prev) => !prev);
            }, 500);

            setTimeout(() => {
                clearInterval(flashInterval);
                setVisible(true);
                setFlash(false);
            }, flashTime); // Flash for flashTime milliseconds
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [delay, flashTime]);

    // Define the styles with animations
    const terminalStyle: CSSProperties = {
        textAlign: 'center',
        width: customWidth ?? '100vw',

        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',

        transform: `scale(${scaleFactor})`,
        animation: flash
            ? 'flash 1s infinite'
            : visible
              ? 'appear 0.1s forwards'
              : 'none',
        opacity: visible ? 1 : 0,
    };

    // Add the CSS for the animations
    useEffect(() => {
        const styleSheet = document.styleSheets[0] as CSSStyleSheet;
        const keyframesFlash = `@keyframes flash {
         0%, 10%, 40%, 50%, 65%, 85% { opacity: 1; }
         5%, 30%, 45%, 55%, 75%, 90% { opacity: 0; }
       }`;
        const keyframesAppear = `@keyframes appear {
         from { opacity: 0; }
         to { opacity: 1; }
       }`;
        const keyframesDisappear = `@keyframes disappear {
         to { opacity: 0; }
       }`;

        styleSheet.insertRule(keyframesFlash, styleSheet.cssRules.length);
        styleSheet.insertRule(keyframesAppear, styleSheet.cssRules.length);
        styleSheet.insertRule(keyframesDisappear, styleSheet.cssRules.length);
    }, []);

    const textClassName = `${styles.flashingSvgtext} ${flash ? styles.flashingSvgFlash : visible ? styles.flashingSvgAppear : ''}`;

    return (
        <div style={terminalStyle} className={styles.terminalStyle}>
            <div className={styles.logoContainer}>
                <img src={logo} alt='' />
            </div>

            <div className={textClassName}>
                Unique ticker auctions with instant locked liquidity and no
                hidden supply.
            </div>
            <div className={textClassName}>Memes as public goods.</div>
        </div>
    );
}
