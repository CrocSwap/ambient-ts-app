import styles from './CarouselItem.module.css';

interface CarouselItemProps {
    children: React.ReactNode;
    width: number | string;
}

export default function CarouselItem(props: CarouselItemProps) {
    const { children, width } = props;
    return (
        <div className={styles.carousel_tem} style={{ width: width }}>
            {children}
        </div>
    );
}
