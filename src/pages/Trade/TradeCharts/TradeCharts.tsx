import styles from './TradeCharts.module.css';

interface TradeChartsProps {
    children: React.ReactNode;
}

export default function TradeCharts(props: TradeChartsProps) {
    return <div className={styles.row}>{props.children}</div>;
}
