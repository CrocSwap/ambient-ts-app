import styles from './Stats.module.css';

interface StatCardProps {
    title: string;
    value: string | number;
}
function StatCard(props: StatCardProps) {
    const { title, value } = props;

    return (
        <div className={styles.stat_card_container}>
            <div className={styles.title}>{title}</div>
            <div className={styles.value}>{value}</div>
        </div>
    );
}
export default function Stats() {
    const statCardData = [
        {
            title: 'Total TVL',
            value: '1,000,000,000',
        },
        {
            title: 'Total Volume',
            value: '1,000,000,000',
        },
        {
            title: 'Total Fees',
            value: '1,000,000,000',
        },
    ];
    return (
        <div className={styles.container}>
            <div className={styles.title}>Ambient Finance Stats</div>
            <div className={styles.content}>
                {statCardData.map((card, idx) => (
                    <StatCard key={idx} title={card.title} value={card.value} />
                ))}
            </div>
        </div>
    );
}
