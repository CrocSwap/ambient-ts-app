import {
    memo,
    // useContext
} from 'react';

import SwapComponent from '../Trade/Swap/Swap';
import styles from './Swap.module.css';

const arrowDisplay = (
    <div className={styles.arrow_container}>
        <span>↓</span>↑
    </div>
);

function Swap() {
    return (
        <div className={styles.swap_page_container}>
            <div className={styles.swap_page_content}>
                {arrowDisplay}
                <h2>SWAP</h2>
                <p className={styles.swap_text}>
                    Swap testnet tokens & earn Miles daily
                </p>
                <SwapComponent />
            </div>
        </div>
    );
}

export default memo(Swap);
