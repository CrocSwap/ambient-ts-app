import styles from './SidebarRangePositions.module.css';
import SidebarRangePositionsCard from './SidebarRangePositionsCard';
export default function SidebarRangePositions() {
    const header = (
        <div className={styles.header}>
            <div>Pool</div>
            <div>Price</div>
            <div>Change</div>
        </div>
    );

    const mapItems = [1, 2, 3, 4, 5, 6, 7];
    return (
        <div className={styles.container}>
            {header}
            <div className={styles.content}>
                {mapItems.map((item, idx) => (
                    <SidebarRangePositionsCard key={idx} />
                ))}
            </div>
        </div>
    );
}
