import styles from './LimitOrder.module.css';
export default function LimitOrder() {
    return (
        <tr>
            <td data-column='Position ID' className={styles.position_id}>
                0xfs05...db35
            </td>
            <td data-column='Limit Price' className={styles.limit_price}>
                3200.00
            </td>
            <td data-column='From' className={styles.from}>
                4.00ETH
            </td>
            <td data-column='To' className={styles.to}>
                12,00.00 USDC
            </td>
            <td data-column='' className={styles.option_buttons}>
                <button className={styles.option_button}>Edit</button>
                <button className={styles.option_button}>Remove</button>
            </td>
        </tr>
    );
}
