import styles from './OverlayComponent.module.css';
import { ReactNode } from 'react';

interface OverlayComponentPropsIF {
    children: ReactNode;
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
}
export default function OverlayComponent(props: OverlayComponentPropsIF) {
    const { children, top, bottom, left, right } = props;

    const topStyle = top ? top : '0';
    const bottomStyle = bottom ? bottom : '0';
    const leftStyle = left ? left : '0';
    const rightStyle = right ? right : '0';

    const showGlobalOverlay = false;
    const wrapperStyle = showGlobalOverlay ? styles.overlay_wrapper_active : styles.overlay_wrapper;
    return (
        <div
            className={wrapperStyle}
            style={{ top: topStyle, bottom: bottomStyle, left: leftStyle, right: rightStyle }}
        >
            {children}
        </div>
    );
}
