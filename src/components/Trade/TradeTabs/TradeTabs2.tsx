import styles from './TradeTabs2.module.css';

interface TradeTabs2Props {
    children: React.ReactNode;
}

export default function TradeTabs2(props: TradeTabs2Props) {
    return <div className={styles.row}>{props.children}</div>;
}
