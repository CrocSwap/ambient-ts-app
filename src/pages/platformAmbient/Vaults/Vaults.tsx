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
    ReceiptContext,
    UserDataContext,
} from '../../../contexts';
import { fallbackVaultsList } from './fallbackVaultsList';
import { Vault } from './Vault';
import VaultRow from './VaultRow/VaultRow';
import styles from './Vaults.module.css';

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

    const { userAddress, isUserConnected, userVaultData, setUserVaultData } =
        useContext(UserDataContext);

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

        const fetchData = async () => {
            try {
                const allVaultsResponse = await fetch(allVaultsEndpoint);
                const chainVaultsResponse = await fetch(chainVaultsEndpoint);
                const { data: allVaultsData } = await allVaultsResponse.json();
                const { data: chainVaultsData } =
                    await chainVaultsResponse.json();
                const uniqueVaults = new Map<string, AllVaultsServerIF>();

                // Combine vaults and filter for uniqueness based on the 'ID' property
                allVaultsData?.vaults
                    .concat(chainVaultsData?.vaults)
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
                console.log({ error });
                setAllVaultsData(undefined);
                setServerErrorReceived(true);
                return;
            }
        };

        const timeout = new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, 2000);
        });

        await Promise.race([fetchData(), timeout]);
    }

    const [serverErrorReceived, setServerErrorReceived] =
        useState<boolean>(false);

    // logic to get user vault data
    async function getUserVaultData(): Promise<void> {
        // endpoint to query
        // const endpoint = `${VAULTS_API_URL}/users/positions?walletAddress=0xe09de95d2a8a73aa4bfa6f118cd1dcb3c64910dc`;
        const endpoint = `${VAULTS_API_URL}/users/positions?walletAddress=${userAddress}`;
        // fn to fetch data from endpoint and send to local state
        const fetchData = async () => {
            try {
                const response = await fetch(endpoint);
                const { data } = await response.json();
                setUserVaultData(data ?? undefined);
                setServerErrorReceived(false);
            } catch (error) {
                console.log({ error });
                setUserVaultData(undefined);
                setServerErrorReceived(true);
                return;
            }
        };

        const timeout = new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, 2000);
        });

        await Promise.race([fetchData(), timeout]);
    }

    useEffect(() => {
        if (userAddress && chainId) {
            getUserVaultData();
            const period = isUserIdle ? 600000 : 60000; // 10 minutes while idle, 1 minute while active
            const interval = setInterval(getUserVaultData, period);
            return () => clearInterval(interval);
        }
    }, [chainId, userAddress, isUserIdle]);

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
        setTimeout(() => {
            getUserVaultData();
        }, 5000);
        setTimeout(() => {
            getUserVaultData();
        }, 15000);
        setTimeout(() => {
            getUserVaultData();
        }, 30000);
    }, [sessionReceipts.length]);

    const tempItems = [1, 2, 3, 4, 5];

    const skeletonDisplay = tempItems.map((item, idx) => (
        <TokenRowSkeleton key={idx} />
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
                                          needsFallbackQuery={
                                              serverErrorReceived
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
