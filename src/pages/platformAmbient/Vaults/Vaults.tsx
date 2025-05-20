import { memo, useContext, useEffect, useState } from 'react';
import { VAULTS_API_URL } from '../../../ambient-utils/constants';
import {
    AllVaultsServerIF,
    UserVaultsServerIF,
    VaultIF,
} from '../../../ambient-utils/types';
import TokenRowSkeleton from '../../../components/Global/Explore/TokenRow/TokenRowSkeleton';
import {
    AppStateContext,
    ChainDataContext,
    CrocEnvContext,
    ReceiptContext,
    UserDataContext,
} from '../../../contexts';
import { fallbackVaultsList } from './fallbackVaultsList';
import { Vault } from './Vault';
import VaultRow from './VaultRow/VaultRow';
import styles from './Vaults.module.css';
import { toDisplayQty } from '@crocswap-libs/sdk';

function Vaults() {
    // !important:  once we have mock data, change the type on this
    // !important:  ... value to `AllVaultsServerIF[]` and then fix linter
    // !important:  ... warnings which manifest in response

    const {
        activeNetwork: { chainId },
        isUserIdle,
    } = useContext(AppStateContext);
    const { sessionReceipts } = useContext(ReceiptContext);

    const { allVaultsData, setAllVaultsData } = useContext(ChainDataContext);
    const { crocEnv } = useContext(CrocEnvContext);

    const { userAddress, isUserConnected, userVaultData, setUserVaultData } =
        useContext(UserDataContext);

    const [receiptRefreshTimeouts, setReceiptRefreshTimeouts] = useState<
        NodeJS.Timeout[]
    >([]);

    const vaultHeader = (
        <div className={styles.vaultHeader}>
            <span />
            <span className={styles.poolName} />
            <span className={styles.tvl}>TVL</span>
            <span
                className={`${styles.depositContainer} ${!isUserConnected && styles.hideDepositOnMobile}`}
            >
                My Deposit
            </span>
            <span
                className={`${styles.aprDisplay} ${!isUserConnected && styles.showAprOnMobile}`}
            >
                APR
            </span>
            <span className={styles.actionButtonContainer} />
        </div>
    );

    async function getAllVaultsData(): Promise<void> {
        const allVaultsEndpoint = `${VAULTS_API_URL}/vaults`;
        const chainVaultsEndpoint = `${VAULTS_API_URL}/vaults?chainId=${parseInt(chainId)}`;

        try {
            // Fetch both responses concurrently
            const [allVaultsResponse, chainVaultsResponse] = await Promise.all([
                fetch(allVaultsEndpoint),
                fetch(chainVaultsEndpoint),
            ]);

            // Parse JSON responses concurrently
            const [allVaultsData, chainVaultsData] = await Promise.all([
                allVaultsResponse.json(),
                chainVaultsResponse.json(),
            ]);

            const uniqueVaults = new Map<string, AllVaultsServerIF>();

            // Combine vaults and filter for uniqueness based on the 'id' property
            allVaultsData?.data?.vaults
                .concat(chainVaultsData?.data?.vaults)
                .forEach((vault: AllVaultsServerIF) => {
                    if (vault.id && !uniqueVaults.has(vault.id)) {
                        uniqueVaults.set(vault.id, vault);
                    }
                });

            // Convert the map back to an array and sort it
            const sorted: AllVaultsServerIF[] = Array.from(
                uniqueVaults.values(),
            ).sort(
                (a: AllVaultsServerIF, b: AllVaultsServerIF) =>
                    parseFloat(b.tvlUsd) - parseFloat(a.tvlUsd),
            );

            setAllVaultsData(sorted ?? undefined);
        } catch (error) {
            console.error('Error fetching vault data:', error);
            setAllVaultsData(undefined);
        }
    }

    // logic to get user vault data
    async function getUserVaultData(): Promise<void> {
        if (userAddress && chainId && crocEnv && allVaultsData) {
            let calls: Map<AllVaultsServerIF, Promise<bigint>> = new Map();
            for (const vaultSpec of allVaultsData || []) {
                if (parseInt(vaultSpec.chainId) != parseInt(chainId)) continue;
                let vault = crocEnv.tempestVault(
                    vaultSpec.address,
                    vaultSpec.mainAsset,
                    vaultSpec.strategy,
                );
                calls.set(vaultSpec, vault.balanceToken1(userAddress));
            }
            await Promise.all(calls.values());
            const chainUserVaults: UserVaultsServerIF[] = [];
            for (const [vaultSpec, balanceInt] of calls.entries()) {
                if ((await balanceInt) == 0n) continue;
                const balance = (await balanceInt).toString();
                const balanceAmount = toDisplayQty(
                    await balanceInt,
                    vaultSpec.token1Decimals,
                );
                chainUserVaults.push({
                    chainId: vaultSpec.chainId,
                    vaultAddress: vaultSpec.address,
                    walletAddress: userAddress as `0x${string}`,
                    balance,
                    balanceAmount,
                    balanceUsd: '',
                });
            }

            setUserVaultData(chainUserVaults);
        }
    }

    useEffect(() => {
        // clear user vault data when the user changes
        setUserVaultData(undefined);
    }, [userAddress]);

    useEffect(() => {
        if (userAddress && chainId && allVaultsData && crocEnv) {
            getUserVaultData();
            const period = isUserIdle ? 600000 : 60000; // 10 minutes while idle, 1 minute while active
            const interval = setInterval(getUserVaultData, period);
            return () => clearInterval(interval);
        }
    }, [chainId, userAddress, isUserIdle, allVaultsData, crocEnv]);

    // logic to fetch vault data from API
    useEffect(() => {
        // run the first fetch immediately
        getAllVaultsData();
        // run subsequent fetches on an interval
        const period = isUserIdle ? 600000 : 60000; // 10 minutes while idle, 1 minute while active
        const interval = setInterval(getAllVaultsData, period);
        // clear the interval when this component dismounts
        return () => clearInterval(interval);
    }, [isUserIdle, chainId]);

    useEffect(() => {
        // also run the user data fetch after a receipt is received
        if (sessionReceipts.length === 0) return;
        getUserVaultData();
        // and repeat after a delay
        const t1 = setTimeout(() => {
            getUserVaultData();
        }, 5000);
        const t2 = setTimeout(() => {
            getUserVaultData();
        }, 15000);
        const t3 = setTimeout(() => {
            getUserVaultData();
        }, 30000);

        setReceiptRefreshTimeouts([t1, t2, t3]);

        // clear the timeouts when this component dismounts
        return () => {
            receiptRefreshTimeouts.forEach((timeout) => clearTimeout(timeout));
        };
    }, [sessionReceipts.length]);

    useEffect(() => {
        // clear the timeouts when the user or chain changes
        receiptRefreshTimeouts.forEach((timeout) => clearTimeout(timeout));
        setReceiptRefreshTimeouts([]);
    }, [userAddress, chainId]);

    const tempItems = [1, 2, 3, 4, 5];

    const skeletonDisplay = tempItems.map((item, idx) => (
        <TokenRowSkeleton key={idx} isVaultPage />
    ));

    const vaultsOnCurrentChain =
        allVaultsData !== undefined
            ? allVaultsData?.filter(
                  (vault) => Number(vault.chainId) === Number(chainId),
              )
            : undefined;

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
                    {allVaultsData === null ||
                    (vaultsOnCurrentChain !== undefined &&
                        vaultsOnCurrentChain.length === 0)
                        ? skeletonDisplay
                        : (vaultsOnCurrentChain && vaultsOnCurrentChain.length
                              ? vaultsOnCurrentChain
                              : fallbackVaultsList
                          )
                              .sort(
                                  (
                                      a: VaultIF | AllVaultsServerIF,
                                      b: VaultIF | AllVaultsServerIF,
                                  ) =>
                                      parseFloat(b.tvlUsd) -
                                      parseFloat(a.tvlUsd),
                              )

                              .map((vault: VaultIF | AllVaultsServerIF) => {
                                  const KEY_SLUG = 'vault_row_';
                                  return (
                                      <VaultRow
                                          key={KEY_SLUG + vault.address}
                                          idForDOM={KEY_SLUG + vault.address}
                                          vault={
                                              new Vault(
                                                  vault,
                                                  userVaultData?.find(
                                                      (
                                                          uV: UserVaultsServerIF,
                                                      ) =>
                                                          uV.vaultAddress.toLowerCase() ===
                                                              vault.address.toLowerCase() &&
                                                          uV.chainId ===
                                                              vault.chainId,
                                                  ),
                                              )
                                          }
                                      />
                                  );
                              })}
                </div>
            </div>
        </div>
    );
}

export default memo(Vaults);
