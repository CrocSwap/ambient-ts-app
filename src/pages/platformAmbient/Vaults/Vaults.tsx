// START: Import React and Dongles
import { memo, useContext, useEffect, useState } from 'react';
import styles from './Vaults.module.css';
import VaultRow from './VaultRow/VaultRow';
import { VaultIF } from '../../../ambient-utils/types';
import { AppStateContext, ReceiptContext } from '../../../contexts';
import { VAULTS_API_URL } from '../../../ambient-utils/constants';
import { mockAllVaultsData } from './mockVaultData';

function Vaults() {
    // !important:  once we have mock data, change the type on this
    // !important:  ... value to `VaultIF[]` and then fix linter
    // !important:  ... warnings which manifest in response

    const {
        activeNetwork: { chainId },
        isUserIdle,
    } = useContext(AppStateContext);

    const { sessionReceipts } = useContext(ReceiptContext);

    const vaultHeader = (
        <div className={styles.vaultHeader}>
            <span />
            <span className={styles.poolName}></span>
            <span className={styles.tvl}>TVL</span>
            <span className={styles.depositContainer}>My Deposit</span>
            <span className={styles.apyDisplay}>APR</span>
            <span className={styles.actionButtonContainer} />
        </div>
    );

    // vault data from tempest API
    const [allVaultsData, setAllVaultsData] = useState<VaultIF[] | undefined>();

    async function getAllVaultsData(): Promise<void> {
        const endpoint = `${VAULTS_API_URL}/vaults`;
        const response = await fetch(endpoint);
        const { data } = await response.json();
        const sorted: VaultIF[] = data.vaults.sort(
            (a: VaultIF, b: VaultIF) =>
                parseFloat(b.tvlUsd) - parseFloat(a.tvlUsd),
        );
        setAllVaultsData(sorted);
    }

    // logic to fetch vault data from API
    useEffect(() => {
        // run the first fetch immediately
        getAllVaultsData();
        // run subsequent fetches on an interval
        const period = isUserIdle ? 600000 : 60000; // 10 minutes while idle, 1 minute while active
        const interval = setInterval(getAllVaultsData, period);
        // clear the interval when this component dismounts
        return () => clearInterval(interval);
    }, [sessionReceipts.length, isUserIdle]);

    return (
        <div data-testid={'vaults'} className={styles.container}>
            <div className={styles.content}>
                <header className={styles.vault_page_header}>
                    <h3>Vaults</h3>
                    <p>
                        Vaults built on top of Ambient liquidity pools for
                        simplified strategic liquidity management. Deployed and
                        managed by partner protocols like Tempest.
                    </p>
                </header>
                {vaultHeader}
                <div
                    className={`${styles.scrollableContainer} custom_scroll_ambient`}
                >
                    {(
                        allVaultsData ||
                        mockAllVaultsData.sort(
                            (a: VaultIF, b: VaultIF) =>
                                parseFloat(b.tvlUsd) - parseFloat(a.tvlUsd),
                        )
                    )
                        .filter(
                            (vault) =>
                                Number(vault.chainId) === Number(chainId),
                        )
                        .map((vault: VaultIF) => {
                            const KEY_SLUG = 'vault_row_';
                            return (
                                <VaultRow
                                    key={KEY_SLUG + vault.address}
                                    idForDOM={KEY_SLUG + vault.address}
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
