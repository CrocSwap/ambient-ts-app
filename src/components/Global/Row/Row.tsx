import styles from 'Row.module.css';

interface RowProps {
    children: React.ReactNode;
}

export default function Row(props: RowProps) {
    return <div className={styles.row}>{props.children}</div>;
}
