import styles from './SidebarLimtOrdersCard.module.css';

export default function SidebarLimtOrdersCard() {
    const rangeStatusDisplay = (
        <div className={styles.range_status_container}>
            <div className={styles.inner_circle_1}>
                <div className={styles.inner_circle_2}></div>
            </div>
        </div>
    );
    return (
        <div className={styles.container}>
            <div>Pool</div>
            <div>Range</div>
            <div className={styles.status_display}>
                Qty
                {rangeStatusDisplay}
            </div>
        </div>
    );
}
