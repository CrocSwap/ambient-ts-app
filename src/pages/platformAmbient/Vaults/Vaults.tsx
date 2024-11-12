// START: Import React and Dongles
import { memo } from 'react';

import styles from './Vaults.module.css';
import VaultRow from './VaultRow/VaultRow';

function Vaults() {
    const vaultData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    const vaultHeader = (
        <div className={styles.vaultHeader}>
            <span/>
            <span className={styles.poolName}></span>
            <span className={styles.tvl}>TVL</span>
            <span className={styles.depositContainer}>
                 My Deposit
            </span>
            <span className={styles.apyDisplay}>APY</span>
            <span className={styles.actionButtonContainer} />
        </div>
    );
  

    return (
        <div data-testid={'portfolio'} className={styles.container}>
            <div className={styles.content}>
                <h3 className={styles.mainTitle}>Vaults</h3>
            {vaultHeader}
                <div className={`${styles.scrollableContainer} custom_scroll_ambient`}>


            {vaultData.map((data, idx) => (
                <VaultRow key={idx} />
            ))}
            </div>
            </div>
            
        </div>
    );
}

export default memo(Vaults);
