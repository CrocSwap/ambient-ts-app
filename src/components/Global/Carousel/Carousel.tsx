import styles from './Carousel.module.css';
import React, { cloneElement } from 'react';

interface CarouselProps {
    children?: React.ReactNode;
}

interface CarouselItemProps {
    children: React.ReactNode;
    width?: number | string;
}

export const CarouselItem = (props: CarouselItemProps) => {
    const { children, width } = props;
    return (
        <div className={styles.carousel_item} style={{ width: width }}>
            {children}
        </div>
    );
};

export default function Carousel(props: CarouselProps) {
    const { children } = props;
    return (
        <div className={styles.carousel}>
            <div className={styles.inner} style={{ transform: 'translateX(-0%)' }}>
                {React.Children.map(children, (child) =>
                    cloneElement(child as React.ReactElement<any>, { width: '100%' }),
                )}
            </div>
        </div>
    );
}
