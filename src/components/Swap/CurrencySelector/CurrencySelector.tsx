import styles from 'CurrencySelector.module.css';

interface CurrencySelectorProps {
    children: React.ReactNode;
}

export default function CurrencySelector(props: CurrencySelectorProps) {
    return <div className={styles.row}>{props.children}</div>;
}
