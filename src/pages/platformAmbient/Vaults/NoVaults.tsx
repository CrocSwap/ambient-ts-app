import styles from './NoVaults.module.css';
import Button from '../../../components/Form/Button';
import { AppStateContext } from '../../../contexts';
import { useContext, useEffect } from 'react';
import {
    scrollMainnet,
    vaultSupportedNetworks,
} from '../../../ambient-utils/constants';
import { useSwitchNetwork, useWeb3ModalAccount } from '@web3modal/ethers/react';

export default function NoVaults() {
    const { chooseNetwork } = useContext(AppStateContext);

    const { isConnected } = useWeb3ModalAccount();
    const { switchNetwork } = useSwitchNetwork();

    async function goToScroll(): Promise<void> {
        isConnected
            ? await switchNetwork(parseInt(scrollMainnet.chainId))
            : chooseNetwork(scrollMainnet);
    }

    useEffect(() => {
        console.log({ vaultSupportedNetworks });
    }, [vaultSupportedNetworks]);

    const BUTTON_DOM_ID = 'change_network_to_scroll';

    return (
        <div className={styles.no_vaults}>
            <h3>To use Vaults please change network to Scroll.</h3>
            <Button
                idForDOM={BUTTON_DOM_ID}
                title='Change to Scroll'
                action={() => goToScroll()}
            />
        </div>
    );
}
