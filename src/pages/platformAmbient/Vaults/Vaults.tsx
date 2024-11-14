// START: Import React and Dongles
import { memo, useContext, useEffect, useMemo, useState } from 'react';
import styles from './Vaults.module.css';
import VaultRow from './VaultRow/VaultRow';
import { AllVaultsServerIF, VaultIF } from '../../../ambient-utils/types';
import { AppStateContext, ReceiptContext } from '../../../contexts';
import { VAULTS_API_URL } from '../../../ambient-utils/constants';
import { mockAllVaultsData } from './mockVaultData';
import { UserVaultsServerIF } from '../../../ambient-utils/types/vaults/userVaultsServerIF';

function Vaults() {
    // !important:  once we have mock data, change the type on this
    // !important:  ... value to `AllVaultsServerIF[]` and then fix linter
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
    const [allVaultsData, setAllVaultsData] = useState<
        AllVaultsServerIF[] | null | undefined
    >(null);

    async function getAllVaultsData(): Promise<void> {
        const endpoint = `${VAULTS_API_URL}/vaults`;
        const response = await fetch(endpoint);
        const { data } = await response.json();
        const sorted: AllVaultsServerIF[] = data.vaults.sort(
            (a: AllVaultsServerIF, b: AllVaultsServerIF) =>
                parseFloat(b.tvlUsd) - parseFloat(a.tvlUsd),
        );
        console.log(sorted);
        setAllVaultsData(sorted);
    }

    // hooks to fetch and hold user vault data
    const [userVaultData, setUserVaultData] = useState<
        UserVaultsServerIF[] | null | undefined
    >(null);
    async function getUserVaultData(): Promise<void> {
        const endpoint = `${VAULTS_API_URL}/users/positions?walletAddress=0xe09de95d2a8a73aa4bfa6f118cd1dcb3c64910dc`;
        const response = await fetch(endpoint);
        const { data } = await response.json();
        setUserVaultData(data);
    }

    useEffect(() => {
        getUserVaultData();
    }, []);

    const vaultsForDOM = useMemo<VaultIF[] | undefined>(() => {
        function decorateVault(v: AllVaultsServerIF): VaultIF {
            const output: VaultIF = {
                ...v,
                balance: undefined,
                balanceAmount: undefined,
                balanceUsd: undefined,
            };
            if (userVaultData) {
                const userVault: UserVaultsServerIF | undefined =
                    userVaultData.find(
                        (uV: UserVaultsServerIF) =>
                            uV.vaultAddress.toLowerCase() ===
                            v.address.toLowerCase(),
                    );
                if (userVault) {
                    output.balance = userVault.balance;
                    output.balanceAmount = userVault.balanceAmount;
                    output.balanceUsd = userVault.balanceUsd;
                }
            }
            return output;
        }
        let output: VaultIF[] | undefined;
        if (allVaultsData && userVaultData) {
            output = allVaultsData.map((v: AllVaultsServerIF) =>
                decorateVault(v),
            );
        }
        return output;
    }, [allVaultsData, userVaultData]);

    console.log(vaultsForDOM);

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
                            (a: AllVaultsServerIF, b: AllVaultsServerIF) =>
                                parseFloat(b.tvlUsd) - parseFloat(a.tvlUsd),
                        )
                    )
                        .filter(
                            (vault) =>
                                Number(vault.chainId) === Number(chainId),
                        )
                        .map((vault: AllVaultsServerIF) => {
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
