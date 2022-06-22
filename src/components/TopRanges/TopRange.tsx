import styles from './TopRange.module.css';

export default function TopRange() {
    return (
        <tr>
            <td data-column='TopRange ID' className={styles.topRange_id}>
                0xfs05...db35
            </td>
            <td data-column='Range' className={styles.topRange_range}>
                2100.00 3200.00
            </td>
            <td data-column='APY' className={styles.apy}>
                35.65%
            </td>
            <td data-column='Range Status'></td>
        </tr>
    );
}
