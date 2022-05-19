import styles from './PriceInput.module.css';

interface priceInputProps {
    children: React.ReactNode;
}

export default function PriceInput(props: priceInputProps) {
    return <div className={styles.row}>{props.children}</div>;
}
