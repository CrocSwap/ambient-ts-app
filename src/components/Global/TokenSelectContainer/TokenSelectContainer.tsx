import styles from './TokenSelectContainer.module.css';

interface TokenSelectContainerProps {
    children: React.ReactNode;
}

export default function TokenSelectContainer(props: TokenSelectContainerProps) {
    return <div className={styles.row}>{props.children}</div>;
}
