import { Moralis } from 'moralis';
import { AuthenticateOptions } from 'react-moralis/lib/hooks/core/useMoralis/_useMoralisAuth';
import { Web3EnableOptions } from 'react-moralis/lib/hooks/core/useMoralis/_useMoralisWeb3';

import styles from './WalletModal.module.css';
import Modal from '../../../components/Global/Modal/Modal';
import { useTermsOfService } from '../../hooks/useTermsOfService';
import authenticateMetamask from '../../../utils/functions/authenticateMetamask';

interface WalletModalPropsIF {
    closeModalWallet: () => void;
    isAuthenticated: boolean;
    isWeb3Enabled: boolean;
    authenticate: (options?: AuthenticateOptions | undefined) => Promise<Moralis.User<Moralis.Attributes> | undefined>;
    enableWeb3: (options?: Web3EnableOptions | undefined) => Promise<Moralis.Web3Provider | undefined>;
}

export default function WalletModal(props: WalletModalPropsIF) {
    const {
        closeModalWallet,
        isAuthenticated,
        isWeb3Enabled,
        authenticate,
        enableWeb3
    } = props;

    const { tosText, acceptToS } = useTermsOfService();

    return (
        <div className={styles.wallet_modal}>
            <Modal 
                onClose={closeModalWallet}
                title='Choose a Wallet'
                footer={tosText}
            >
                <button
                    onClick={() => {
                        authenticateMetamask(
                            isAuthenticated,
                            isWeb3Enabled,
                            authenticate,
                            enableWeb3,
                        );
                        acceptToS();
                    }}
                >
                    Metamask
                </button>
                <button>
                    Connect with Email
                </button>
            </Modal>
        </div>
    );
}