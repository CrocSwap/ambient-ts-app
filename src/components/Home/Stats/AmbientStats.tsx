import styles from './Stats.module.css';
import { motion, useViewportScroll, useTransform } from 'framer-motion';

interface StatCardProps {
    title: string;
    value: string | number;
    speed: number;
}
function StatCard(props: StatCardProps) {
    const { title, value, speed } = props;
    const { scrollYProgress } = useViewportScroll();
    const yValue = useTransform(scrollYProgress, [0, 0.5, 1], [0, 50, 100 * speed]);
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{ y: yValue }}
            className={styles.stat_card_container}
        >
            <div className={styles.title}>{title}</div>
            <div className={styles.value}>{value}</div>
        </motion.div>
    );
}
export default function Stats() {
    const statCardData = [
        {
            title: 'Total TVL',
            value: '1,000,000,000',
            speed: -2,
        },
        {
            title: 'Total Volume',
            value: '1,000,000,000',
            speed: 0,
        },
        {
            title: 'Total Fees',
            value: '1,000,000,000',
            speed: -1.5,
        },
    ];
    return (
        <div className={styles.container}>
            <div className={styles.title}>Ambient Finance Stats</div>
            <div className={styles.content}>
                {statCardData.map((card, idx) => (
                    <StatCard key={idx} title={card.title} value={card.value} speed={card.speed} />
                ))}
            </div>
        </div>
    );
}
