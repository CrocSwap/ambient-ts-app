import { ReactNode } from 'react';
import styles from './Banner.module.css';

type BannerProps = {
    children: ReactNode;
    height: string | number;
    width?: string | number;
    background?: string;
    className?: string;
};

export function Banner({
    children,
    height,
    width = '100%',
    background = 'transparent',
    className,
}: BannerProps) {
    return (
        <div
            className={`${styles.banner} ${className ?? ''}`}
            style={{
                height: typeof height === 'number' ? `${height}px` : height,
                width: typeof width === 'number' ? `${width}px` : width,
                background,
            }}
        >
            {children}
        </div>
    );
}
