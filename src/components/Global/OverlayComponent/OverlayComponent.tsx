import { ReactNode } from 'react';
import styles from './OverlayComponent.module.css';

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

    const showGlobalOverlay = true;
    const wrapperStyle = showGlobalOverlay
        ? styles.overlay_wrapper_active
        : styles.overlay_wrapper;
    return (
        <div
            className={wrapperStyle}
            style={{
                top: topStyle,
                bottom: bottomStyle,
                left: leftStyle,
                right: rightStyle,
            }}
        >
            <h3>{children}</h3>
            <p>
                Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                Reprehenderit, ratione!
            </p>
        </div>
    );
}
