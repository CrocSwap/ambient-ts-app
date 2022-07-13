import styles from './TransactionCard.module.css';

export default function TransactionCard() {
    const buttonsDisplay = (
        <div className={styles.buttons_container}>
            <button className={styles.details_button}>Edit</button>
            <button className={styles.details_button}>Copy</button>
            <button className={styles.details_button}>Details</button>
        </div>
    );
    return <div className={styles.row}></div>;
}
