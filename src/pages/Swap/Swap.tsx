import { memo } from 'react';

import SwapComponent from '../Trade/Swap/Swap';
import styles from './Swap.module.css';

function Swap() {
    return (
        <div className={styles.swap_page_container}>{<SwapComponent />}</div>
    );
}

export default memo(Swap);
