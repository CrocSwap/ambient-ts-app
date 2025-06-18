import { memo, useContext } from 'react';
import {
    AllVaultsServerIF,
    UserVaultsServerIF,
    VaultIF,
} from '../../../ambient-utils/types';
import TokenRowSkeleton from '../../../components/Global/Explore/TokenRow/TokenRowSkeleton';
import { ChainDataContext, UserDataContext } from '../../../contexts';
import { fallbackVaultsList } from './fallbackVaultsList';
import { Vault } from './Vault';
import VaultRow from './VaultRow/VaultRow';
import styles from './Vaults.module.css';
function Vaults() {
    // !important:  once we have mock data, change the type on this
    // !important:  ... value to `AllVaultsServerIF[]` and then fix linter
    // !important:  ... warnings which manifest in response

    const { allVaultsData, vaultsOnCurrentChain } =
        useContext(ChainDataContext);

    const { isUserConnected, userVaultData } = useContext(UserDataContext);

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

    const tempItems = [1, 2, 3, 4, 5];

    const skeletonDisplay = tempItems.map((item, idx) => (
        <TokenRowSkeleton key={idx} isVaultPage />
    ));

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
