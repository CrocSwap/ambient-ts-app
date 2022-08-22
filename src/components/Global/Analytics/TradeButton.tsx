import { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TradeButton.module.css';

export default function TradeButton() {
    const navigate = useNavigate();
    function openTradePage(event: MouseEvent<HTMLButtonElement>) {
        navigate('/trade/market');
        event.stopPropagation();
    }

    // TODO:   @Junior do we really need the wrapper in the return below? -Emily
    return (
        <section>
            <button className={styles.trade_button} onClick={openTradePage}>
                Trade
            </button>
        </section>
    );
}
