import { useSwitchNetwork, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { vaultSupportedNetworks } from '../../../ambient-utils/constants';
import { someSupportedNetworkIsVaultSupportedNetwork } from '../../../ambient-utils/dataLayer';
import { NetworkIF } from '../../../ambient-utils/types';
import Button from '../../../components/Form/Button';
import { AppStateContext } from '../../../contexts';
import styles from './NoVaults.module.css';

export default function NoVaults() {
    const { chooseNetwork } = useContext(AppStateContext);

    const { isConnected } = useWeb3ModalAccount();
    const { switchNetwork } = useSwitchNetwork();

    async function changeNetwork(n: NetworkIF): Promise<void> {
        isConnected
            ? await switchNetwork(parseInt(n.chainId))
            : chooseNetwork(n);
    }

    if (!someSupportedNetworkIsVaultSupportedNetwork) {
        return <Navigate to='/404' replace />;
    }

    return (
        <div className={styles.no_vaults}>
            <h3>To use vaults, please switch to a supported network:</h3>
            {Object.values(vaultSupportedNetworks).map((vsn: NetworkIF) => {
                const KEY_SLUG = 'button_for_vaults_on_';
                return (
                    <Button
                        key={KEY_SLUG + JSON.stringify(vsn)}
                        idForDOM={KEY_SLUG + vsn.displayName}
                        title={`Switch to ${vsn.displayName}`}
                        action={() => changeNetwork(vsn)}
                        style={{ color: 'var(--dark2)' }}
                    />
                );
            })}
        </div>
    );
}
