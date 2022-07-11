import styles from './SidebarLimtOrders.module.css';
import SidebarLimtOrdersCard from './SidebarLimtOrdersCard';
export default function SidebarLimtOrders() {
    const header = (
        <div className={styles.header}>
            <div>Pool</div>
            <div>Range</div>
            <div>Amount</div>
        </div>
    );

    const mapItems = [1, 2, 3, 4, 5, 6, 7];
    return (
        <div className={styles.container}>
            {header}
            <div className={styles.content}>
                {mapItems.map((item, idx) => (
                    <SidebarLimtOrdersCard key={idx} />
                ))}
            </div>
        </div>
    );
}
