import styles from './CurrencyDisplau.module.css';

interface CurrencyDisplauProps {
    children: React.ReactNode;
}

export default function CurrencyDisplau(props: CurrencyDisplauProps) {
    return <div className={styles.CurrencyDisplau}>{props.children}</div>;
}
