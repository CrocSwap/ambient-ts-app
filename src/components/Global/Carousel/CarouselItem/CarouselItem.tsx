import styles from './CarouselItem.module.css';

interface CarouselItemProps {
    children: React.ReactNode;
    width: number | string;
}

export default function CarouselItem(props: CarouselItemProps) {
    return <div className={styles.carousel_tem}>{props.children}</div>;
}
