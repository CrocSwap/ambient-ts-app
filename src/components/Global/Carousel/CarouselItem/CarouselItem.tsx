import styles from './CarouselItem.module.css';

interface CarouselItemProps {
    children: React.ReactNode;
    width?: number | string;
    height?: number | string;
}

export default function CarouselItem(props: CarouselItemProps) {
    const { children, width, height } = props;
    return (
        <div className={styles.carousel_item} style={{ width: width, height: height }}>
            {children}
        </div>
    );
}
