import styles from './NetworkSelector.module.css';

interface NetworkSelectorProps {
    children: React.ReactNode;
}

export default function NetworkSelector(props: NetworkSelectorProps) {
    return <div className={styles.row}>{props.children}</div>;
}
