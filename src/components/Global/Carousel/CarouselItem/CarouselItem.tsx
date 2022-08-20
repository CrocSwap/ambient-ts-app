import { ReactNode } from 'react';
import styles from './CarouselItem.module.css';

interface CarouselItemPropsIF {
    children: ReactNode;
    width?: number | string;
    height?: number | string;
}

export default function CarouselItem(props: CarouselItemPropsIF) {
    const { children, width } = props;
    return (
        <div className={styles.carousel_item} style={{ width: width, height: '526px' }}>
            {children}
        </div>
    );
}
