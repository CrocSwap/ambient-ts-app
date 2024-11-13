// START: Import React and Dongles
import { memo, useContext } from 'react';

import styles from './Vaults.module.css';
import VaultRow from './VaultRow/VaultRow';
import { VaultIF } from '../../../ambient-utils/types';
import { allVaultsData } from './mockVaultData';
import { AppStateContext } from '../../../contexts';

function Vaults() {
    // !important:  once we have mock data, change the type on this
    // !important:  ... value to `VaultIF[]` and then fix linter
    // !important:  ... warnings which manifest in response

    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);

    const vaultHeader = (
        <div className={styles.vaultHeader}>
            <span />
            <span className={styles.poolName}></span>
            <span className={styles.tvl}>TVL</span>
            <span className={styles.depositContainer}>My Deposit</span>
            <span className={styles.apyDisplay}>APY</span>
            <span className={styles.actionButtonContainer} />
        </div>
    );

    return (
        <div data-testid={'vaults'} className={styles.container}>
            <div className={styles.content}>
                <h3 className={styles.mainTitle}>Vaults</h3>
                {vaultHeader}
                <div
                    className={`${styles.scrollableContainer} custom_scroll_ambient`}
                >
                    {allVaultsData
                        .filter((vault) => vault.chainId === Number(chainId))
                        .map((vault: VaultIF) => {
                            const KEY_SLUG = 'vault_row_';
                            return (
                                <VaultRow
                                    key={KEY_SLUG + JSON.stringify(vault)}
                                    idForDOM={KEY_SLUG + vault.toString()}
                                    vault={vault}
                                />
                            );
                        })}
                </div>
            </div>
        </div>
    );
}

export default memo(Vaults);
