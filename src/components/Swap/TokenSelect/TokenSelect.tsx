import styles from 'TokenSelect.module.css';

interface TokenSelectProps {
    children: React.ReactNode;
}

export default function TokenSelect(props: TokenSelectProps) {
    return <div className={styles.row}>{props.children}</div>;
}
