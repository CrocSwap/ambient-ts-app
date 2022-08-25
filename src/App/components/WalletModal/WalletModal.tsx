// START: Import React and Dongles
import { useEffect, useMemo, useState } from 'react';
import { Moralis } from 'moralis';
import { AuthenticateOptions } from 'react-moralis/lib/hooks/core/useMoralis/_useMoralisAuth';
import { Web3EnableOptions } from 'react-moralis/lib/hooks/core/useMoralis/_useMoralisWeb3';

// START: Import Local Files
import styles from './WalletModal.module.css';
import Modal from '../../../components/Global/Modal/Modal';
import { useTermsOfService } from '../../hooks/useTermsOfService';
import authenticateMetamask from '../../../utils/functions/authenticateMetamask';

interface WalletModalPropsIF {
    closeModalWallet: () => void;
    isAuthenticating: boolean;
    isAuthenticated: boolean;
    isWeb3Enabled: boolean;
    authenticate: (options?: AuthenticateOptions | undefined) => Promise<Moralis.User<Moralis.Attributes> | undefined>;
    enableWeb3: (options?: Web3EnableOptions | undefined) => Promise<Moralis.Web3Provider | undefined>;
}

export default function WalletModal(props: WalletModalPropsIF) {
    const {
        closeModalWallet,
        isAuthenticating,
        isAuthenticated,
        isWeb3Enabled,
        authenticate,
        enableWeb3
    } = props;

    // close the Connect Wallet modal only when authentication completes
    useEffect(() => {
        isAuthenticated && closeModalWallet();
    }, [isAuthenticating]);

    const { tosText, acceptToS } = useTermsOfService();

    const [ page, setPage ] = useState('wallets');

    const walletsPage = useMemo(() => (
        <>
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
            <button onClick={() => setPage('magicLogin')}>
                Connect with Email
            </button>
        </>
    ), []);

    const magicLoginPage = (
        <h2>This is the Magic Login page!</h2>
    );

    const activeContent = useMemo(() => {
        switch(page) {
            case 'wallets': return walletsPage;
            case 'magicLogin': return magicLoginPage;
            default: magicLoginPage;
        }
    }, [page]);

    const activeTitle = useMemo(() => {
        switch(page) {
            case 'wallets': return 'Choose a Wallet';
            case 'magicLogin': return 'Log In With Email';
            default: 'Choose a Wallet';
        }
    }, [page]);

    const clickBackArrow = useMemo(() => {
        switch(page) {
            case 'wallets': return closeModalWallet;
            case 'magicLogin': return () => setPage('wallets');
            default: closeModalWallet;
        }
    }, [page]);

    return (
        <div className={styles.wallet_modal}>
            <Modal 
                onClose={closeModalWallet}
                handleBack={clickBackArrow}
                showBackButton={true}
                title={activeTitle}
                footer={tosText}
            >
                {activeContent}
            </Modal>
        </div>
    );
}