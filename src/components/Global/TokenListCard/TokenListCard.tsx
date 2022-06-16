import styles from './TokenListCard.module.css';

interface TokenListCardProps {
    children: React.ReactNode;
}

export default function TokenListCard(props: TokenListCardProps) {
    return <div className={styles.row}>{props.children}</div>;
}
