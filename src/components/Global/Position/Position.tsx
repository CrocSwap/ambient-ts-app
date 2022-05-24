import RangeStatus from '../RangeStatus/RangeStatus';
import styles from './Position.module.css';
export default function Position() {
    return (
        <tr>
            <td data-column='Position ID' className={styles.position_id}>
                0xfs05...db35
            </td>
            <td data-column='Range' className={styles.position_range}>
                2100.00 3200.00
            </td>
            <td data-column='APY' className={styles.apy}>
                35.65%
            </td>
            <td data-column='Range Status'>
                <RangeStatus isInRange />
                {/* In Range */}
            </td>
            <td data-column='' className={styles.option_buttons}>
                <button className={styles.option_button}>Harvest</button>
                <button className={styles.option_button}>Edit</button>
                <button className={styles.option_button}>Remove</button>
                <button className={styles.option_button}>Details</button>
            </td>
        </tr>
    );
}
