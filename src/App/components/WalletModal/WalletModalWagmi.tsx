// START: Import React and Dongles
import { useContext, useEffect, useMemo, useState } from 'react';

// START: Import Local Files
import styles from './WalletModalWagmi.module.css';
import Modal from '../../../components/Global/Modal/Modal';
import Button from '../../../components/Form/Button';
import WalletButton from './WalletButton/WalletButton';
import metamaskLogo from '../../../assets/images/logos/MetaMask_Fox.svg';
import braveLogo from '../../../assets/images/logos/brave_lion.svg';
import rabbyLogo from '../../../assets/images/logos/rabby_logo.svg';

import { CircleLoaderFailed } from '../../../components/Global/LoadingAnimations/CircleLoader/CircleLoader';
import WaitingConfirmation from '../../../components/Global/WaitingConfirmation/WaitingConfirmation';
import { IS_LOCAL_ENV } from '../../../constants';
import GateWallet from './GateWallet';
import { useTermsAgreed } from '../../hooks/useTermsAgreed';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { UserDataContext } from '../../../contexts/UserDataContext';

export default function WalletModalWagmi() {
    const {
        wagmiModal: { isOpen: isModalOpen, close: closeModal },
    } = useContext(AppStateContext);

    const {
        isUserConnected,
        connectUser,
        connectors,
        connectError,
        connectIsLoading,
        pendingConnector,
    } = useContext(UserDataContext);

    useEffect(() => {
        if (connectError && connectError.name === 'UserRejectedRequestError') {
            IS_LOCAL_ENV && console.error({ error: connectError });
            setPage('metamaskError');
        }
    }, [connectError]);

    const defaultState = process.env.REACT_APP_VIEW_ONLY
        ? 'notAvailable'
        : 'wallets';

    const [page, setPage] = useState(defaultState);

    // reset the page everytime the modal is closed
    useEffect(() => {
        if (!isModalOpen) {
            setPage(defaultState);
        }
    }, [isModalOpen]);

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
            }, 7000);
            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
    }, [page]);

    // close the Connect Wallet modal only when authentication completes
    useEffect(() => {
        isUserConnected && pendingLoginDelayElapsed && closeModal();
    }, [isUserConnected, pendingLoginDelayElapsed]);

    const learnAboutWalletsContent = (
        <div className={styles.learn_container}>
            <div>New to Ethereum?</div>
            <a
                href='https://ethereum.org/en/wallets/'
                target='_blank'
                rel='noreferrer'
                aria-label='wallets'
            >
                Learn more about Wallets
            </a>
        </div>
    );
    const connectorsDisplay = (
        <div className={styles.wall_buttons_container}>
            {connectors.map((connector) => (
                <WalletButton
                    title={`${connector.name} ${
                        !connector.ready ? ' (unavailable)' : ''
                    }  ${
                        connectIsLoading &&
                        connector.id === pendingConnector?.id
                            ? ' (connecting)'
                            : ''
                    }`}
                    disabled={!connector.ready}
                    key={connector.id + '|' + connector.name} // Join both to ensure uniqueness
                    action={() => {
                        connectUser({ connector });
                        IS_LOCAL_ENV && console.debug({ connector });
                        connector.name.toLowerCase() === 'metamask'
                            ? (() => {
                                  setPage('metamaskPending');
                                  setPendingLoginDelayElapsed(false);
                              })()
                            : connector.name === 'Coinbase Wallet'
                            ? setPage('coinbaseWalletPending')
                            : setPage('metamaskPending');
                    }}
                    logo={
                        connector.name.toLowerCase() === 'metamask'
                            ? metamaskLogo
                            : connector.name === 'Brave'
                            ? braveLogo
                            : connector.name.toLowerCase() === 'rabby'
                            ? rabbyLogo
                            : undefined
                    }
                />
            ))}
        </div>
    );

    const walletsPage = useMemo(
        () => (
            <div className={styles.main_container}>
                {connectorsDisplay}
                {learnAboutWalletsContent}
            </div>
        ),
        [],
    );

    const metamaskPendingPage = (
        <div className={styles.metamask_pending_container}>
            <WaitingConfirmation
                content={
                    !delayForHelpTextElapsed ? (
                        ''
                    ) : (
                        <div>Please check your wallet for notifications.</div>
                    )
                }
            />
        </div>
    );

    const coinbaseWalletPendingPage = (
        <div className={styles.metamask_pending_container}>
            <WaitingConfirmation
                content={'Please complete authentication via WalletConnect'}
            />
        </div>
    );

    const metamaskErrorPage = (
        <div className={styles.metamask_pending_container}>
            <CircleLoaderFailed size='48' />
            <p>The connection to your wallet was rejected. </p>
            <Button
                idForDOM='try_again_button_wallet_connection_error'
                title='Try Again'
                flat={true}
                action={() => {
                    setPage('wallets');
                }}
            />
        </div>
    );

    const notAvailablePage = (
        <div className={styles.metamask_pending_container}>
            <CircleLoaderFailed size='48' />
            <p>Ambient is not available in the United States.</p>
            <Button
                idForDOM='acknowledge_ambient_not_available_in_US_button'
                title='Close'
                flat={true}
                action={() => {
                    closeModal();
                }}
            />
        </div>
    );

    const activeContent = useMemo(() => {
        switch (page) {
            case 'wallets':
                return walletsPage;
            case 'notAvailable':
                return notAvailablePage;
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
                return 'Waiting for Wallet';
            case 'metamaskError':
                return 'Wallet Connection Error';
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
                return closeModal;
            case 'metamaskError':
            case 'magicLogin':
                return () => setPage('wallets');
            default:
                closeModal;
        }
    }, [page]);

    const [recordAgreed, hasAgreedTerms, termUrls] = useTermsAgreed();

    return (
        <Modal
            onClose={closeModal}
            handleBack={clickBackArrow}
            showBackButton={showBackArrow}
            title={!hasAgreedTerms ? 'Welcome' : activeTitle}
        >
            {!hasAgreedTerms ? (
                <GateWallet recordAgreed={recordAgreed} termUrls={termUrls} />
            ) : (
                activeContent
            )}
        </Modal>
    );
}
