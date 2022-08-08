import { Link } from 'react-router-dom';
import styles from './TradeButton.module.css';

export default function TradeButton() {
    function openDetailsModal() {
        console.error('details');
    }

    return (
        <section>
            <button className={styles.trade_button} onClick={openDetailsModal}>
                Trade
            </button>
        </section>
    );
}
