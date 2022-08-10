import { useNavigate } from 'react-router-dom';
import styles from './TradeButton.module.css';

export default function TradeButton() {
    const navigate = useNavigate();
    function openTradePage() {
        navigate('/trade/market');
    }

    return (
        <section>
            <button className={styles.trade_button} onClick={openTradePage}>
                Trade
            </button>
        </section>
    );
}
