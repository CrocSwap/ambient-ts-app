import styles from 'SwapHeader.module.css';

interface SwapHeaderProps {
    children: React.ReactNode;
}

export default function SwapHeader(props: SwapHeaderProps) {
    return <div className={styles.row}>{props.children}</div>;
}
