// START: Import React and Dongles
import { useEffect, useMemo, useState } from 'react';
import { useConnect, useAccount, useEnsName, useDisconnect } from 'wagmi';

// START: Import Local Files
import styles from './WalletModal.module.css';
import Modal from '../../../components/Global/Modal/Modal';
import Button from '../../../components/Global/Button/Button';
import WalletButton from './WalletButton/WalletButton';
import metamaskLogo from '../../../assets/images/logos/MetaMask_Fox.svg';
import braveLogo from '../../../assets/images/logos/brave_lion.svg';

import { CircleLoaderFailed } from '../../../components/Global/LoadingAnimations/CircleLoader/CircleLoader';
import WaitingConfirmation from '../../../components/Global/WaitingConfirmation/WaitingConfirmation';
import { checkBlacklist } from '../../../utils/data/blacklist';

interface WalletModalPropsIF {
    closeModalWallet: () => void;
}

export default function WalletModalWagmi(props: WalletModalPropsIF) {
    const { closeModalWallet } = props;
    const { disconnect } = useDisconnect();

    const { connect, connectors, error, isLoading, pendingConnector } =
        useConnect({
            onSettled(data, error) {
                if (error) console.log({ error });
                const connectedAddress = data?.account;
                const isBlacklisted = connectedAddress
                    ? checkBlacklist(connectedAddress)
                    : false;
                if (isBlacklisted) disconnect();
            },
        });
    const { address, connector, isConnected } = useAccount();
    const { data: ensName } = useEnsName({ address });
    const [page, setPage] = useState('wallets');

    const [pendingLoginDelayElapsed, setPendingLoginDelayElapsed] =
        useState(false);
    const [delayForHelpTextElapsed, setDelayForHelpTextElapsed] =
        useState(false);

    // prevent the pending page from appearing for less than a second
    useEffect(() => {
        if (page === 'metamaskPending') {
            const timer1 = setTimeout(() => {
                setPendingLoginDelayElapsed(true);
            }, 500);
            const timer2 = setTimeout(() => {
                setDelayForHelpTextElapsed(true);
            }, 12000);
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
    }, [page]);

    // close the Connect Wallet modal only when authentication completes
    useEffect(() => {
        isConnected && pendingLoginDelayElapsed && closeModalWallet();
    }, [isConnected, pendingLoginDelayElapsed]);

    const learnAboutWalletsContent = (
        <div className={styles.learn_container}>
            <div>New to Ethereum?</div>
            <a
                href='https://ethereum.org/en/wallets/'
                target='_blank'
                rel='noreferrer'
            >
                Learn more about Wallets
            </a>
        </div>
    );
    const connectorsDisplay = isConnected ? (
        <div key={connector?.id}>
            <div>{ensName ? `${ensName} (${address})` : address}</div>
            <div>Connected to {connector?.name}</div>
            <button
                onClick={() => {
                    disconnect();
                    closeModalWallet();
                }}
            >
                Disconnect
            </button>
        </div>
    ) : (
        <div className={styles.wall_buttons_container}>
            {connectors.map((connector) => (
                <WalletButton
                    title={`${connector.name} ${
                        !connector.ready ? ' (unavailable)' : ''
                    }  ${
                        isLoading && connector.id === pendingConnector?.id
                            ? ' (connecting)'
                            : ''
                    }`}
                    disabled={!connector.ready}
                    key={connector.id}
                    action={() => {
                        connect({ connector });
                        // handleMetamaskAuthentication();
                        console.log({ connector });
                        connector.name.toLowerCase() === 'metamask'
                            ? (() => {
                                  setPage('metamaskPending');
                                  setPendingLoginDelayElapsed(false);
                              })()
                            : connector.name === 'Coinbase Wallet'
                            ? setPage('coinbaseWalletPending')
                            : setPage('metamaskPending');
                        // acceptToS();
                    }}
                    logo={
                        connector.name.toLowerCase() === 'metamask'
                            ? metamaskLogo
                            : connector.name === 'Brave'
                            ? braveLogo
                            : undefined
                    }
                ></WalletButton>
            ))}

            {error && <div>{error.message}</div>}
        </div>
    );

    const walletsPage = useMemo(
        () => (
            <div className={styles.main_container}>
                {connectorsDisplay}
                {/* {walletsDisplay} */}
                {/* <button className={styles.email_button} onClick={() => setPage('magicLogin')}>
                        <HiOutlineMail size={20} color='#EBEBFF' />
                        Connect with Email
                    </button> */}

                {learnAboutWalletsContent}
            </div>
        ),
        [],
    );

    const metamaskPendingPage = (
        <div className={styles.metamask_pending_container}>
            <WaitingConfirmation
                content={
                    !delayForHelpTextElapsed
                        ? ''
                        : `Please check the ${'Metamask'} extension in your browser for notifications.`
                }
            />
        </div>
    );

    const coinbaseWalletPendingPage = (
        <div className={styles.metamask_pending_container}>
            <WaitingConfirmation
                content={'Please complete authentication via WalletConnect.'}
            />
        </div>
    );

    const metamaskErrorPage = (
        <div className={styles.metamask_pending_container}>
            <CircleLoaderFailed />
            <p>
                Check the Metamask extension in your browser for notifications,
                or click &quot;Try Again&quot;. You can also click the left
                arrow above to choose a different wallet.
            </p>
            <Button
                title='Try Again'
                flat={true}
                action={() => {
                    connect({ connector });
                    setPage('metamaskPending');
                }}
            />
        </div>
    );
    const activeContent = useMemo(() => {
        switch (page) {
            case 'wallets':
                return walletsPage;
            case 'metamaskPending':
                return metamaskPendingPage;
            case 'coinbaseWalletPending':
                return coinbaseWalletPendingPage;
            case 'metamaskError':
                return metamaskErrorPage;

            default:
                walletsPage;
        }
    }, [page, delayForHelpTextElapsed]);

    const activeTitle = useMemo(() => {
        switch (page) {
            case 'wallets':
                return 'Choose a Wallet';
            case 'metamaskPending':
                return 'Waiting for Metamask';
            case 'metamaskError':
                return 'Metamask Error';
            case 'magicLogin':
            case 'magicLoginPending':
                return 'Log In With Email';
            default:
                'Choose a Wallet';
        }
    }, [page]);

    const showBackArrow = useMemo(() => {
        switch (page) {
            case 'magicLogin':
            case 'metamaskError':
                return true;
            case 'metamaskPending':
            case 'magicLoginPending':
            default:
                false;
        }
    }, [page]);

    const clickBackArrow = useMemo(() => {
        switch (page) {
            case 'wallets':
                return closeModalWallet;
            case 'metamaskError':
            case 'magicLogin':
                return () => setPage('wallets');
            default:
                closeModalWallet;
        }
    }, [page]);

    return (
        <div className={styles.wallet_modal}>
            <Modal
                onClose={closeModalWallet}
                handleBack={clickBackArrow}
                showBackButton={showBackArrow}
                title={activeTitle}
                centeredTitle={activeTitle === 'Choose a Wallet' ? true : false}
            >
                {activeContent}
            </Modal>
        </div>
    );
}
