import styles from './TokenList.module.css';

interface TokenListProps {
    children: React.ReactNode;
}

export default function TokenList(props: TokenListProps) {
    return <div className={styles.row}>{props.children}</div>;
}
