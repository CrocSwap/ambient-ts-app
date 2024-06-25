import {
    memo,
    useContext,
    // useContext
} from 'react';

import SwapComponent from '../Trade/Swap/Swap';
import styles from './Swap.module.css';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import plumeLogo from '../../assets/images/networks/plume.png';

// const arrowDisplay = (
//     <div className={styles.arrow_container}>
//         <span>↓</span>↑
//     </div>
// );

function Swap() {
    const { isActiveNetworkPlume } = useContext(ChainDataContext);

    if (!isActiveNetworkPlume)
        return (
            <div className={styles.swap_page_container}>
                <SwapComponent />
            </div>
        );
    return (
        <div className={styles.swap_page_container}>
            <div className={styles.swap_page_content}>
                <img src={plumeLogo} alt='plume logo' width='50px' />
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
