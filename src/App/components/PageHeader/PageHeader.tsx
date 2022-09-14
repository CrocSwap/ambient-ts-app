// START: Import React and Dongles
import { useCallback, useEffect, useState, Dispatch, SetStateAction } from 'react';
import { Link } from 'react-router-dom';
import { useMoralis } from 'react-moralis';
import { useTranslation } from 'react-i18next';
import { motion, AnimateSharedLayout } from 'framer-motion';

// START: Import JSX Elements
import Account from './Account/Account';
import MagicLogin from './MagicLogin';
import NetworkSelector from './NetworkSelector/NetworkSelector';
import SwitchNetwork from '../../../components/Global/SwitchNetworkAlert/SwitchNetwork/SwitchNetwork';
import Modal from '../../../components/Global/Modal/Modal';

// START: Import Local Files
import styles from './PageHeader.module.css';
import trimString from '../../../utils/functions/trimString';
import ambientLogo from '../../../assets/images/logos/ambient_logo.svg';
import { useModal } from '../../../components/Global/Modal/useModal';
import MobileSidebar from '../../../components/Global/MobileSidebar/MobileSidebar';
import NotificationCenter from '../../../components/Global/NotificationCenter/NotificationCenter';

interface HeaderPropsIF {
    nativeBalance: string;
    clickLogout: () => void;
    metamaskLocked: boolean;
    ensName: string;
    shouldDisplayAccountTab: boolean;
    chainId: string;
    isChainSupported: boolean;
    switchChain: Dispatch<SetStateAction<string>>;
    switchNetworkInMoralis: (providedChainId: string) => Promise<void>;
    openModalWallet: () => void;
    pendingTransactions: string[];
}

export default function PageHeader(props: HeaderPropsIF) {
    const {
        ensName,
        nativeBalance,
        clickLogout,
        metamaskLocked,
        shouldDisplayAccountTab,
        chainId,
        isChainSupported,
        switchChain,
        switchNetworkInMoralis,
        openModalWallet,
        pendingTransactions,
    } = props;

    const { user, account, enableWeb3, isWeb3Enabled, isAuthenticated } = useMoralis();

    const { t } = useTranslation();

    const [isModalOpen, openModal, closeModal] = useModal();
    const modalTitle = 'Log in with Email';

    const mainModal = (
        <Modal onClose={closeModal} title={modalTitle}>
            <MagicLogin closeModal={closeModal} />
        </Modal>
    );

    const modalOrNull = isModalOpen ? mainModal : null;

    useEffect(() => {
        const timer = setTimeout(() => {
            reenableWeb3();
        }, 100);
        return () => clearTimeout(timer);
    }, [user, account, metamaskLocked]);

    const reenableWeb3 = useCallback(async () => {
        try {
            if (user && !account && !metamaskLocked) {
                await enableWeb3();
            }
        } catch (err) {
            console.warn(`Could not automatically bridge Moralis to wallet. Error follows: ${err}`);
        }
    }, [user, account, metamaskLocked]);

    // end of rive component

    // Page Header states
    // eslint-disable-next-line
    const [mobileNavToggle, setMobileNavToggle] = useState<boolean>(false);
    // End of Page Header States

    // Page Header functions
    // function handleMobileNavToggle() {
    //     setMobileNavToggle(!mobileNavToggle);
    // }

    // -----------------END OF SWITCH NETWORK FUNCTIONALITY--------------------------------------
    const accountAddress = isAuthenticated && account ? trimString(account, 6, 6) : '';

    const accountProps = {
        nativeBalance: nativeBalance,
        accountAddress: accountAddress,
        accountAddressFull: isAuthenticated && account ? account : '',
        ensName: ensName,
        isAuthenticated: isAuthenticated,
        isWeb3Enabled: isWeb3Enabled,
        clickLogout: clickLogout,
        openModal: openModal,
        chainId: chainId,
    };

    // End of Page Header Functions

    const metamaskButton = (
        <button className={styles.authenticate_button} onClick={() => openModalWallet()}>
            Connect Wallet
        </button>
    );

    // ----------------------------NAVIGATION FUNCTIONALITY-------------------------------------

    const { pathname } = location;
    const tradeDestination = location.pathname.includes('trade/market')
        ? '/trade/market'
        : location.pathname.includes('trade/limit')
        ? '/trade/limit'
        : location.pathname.includes('trade/range')
        ? '/trade/range'
        : location.pathname.includes('trade/edit')
        ? '/trade/edit'
        : '/trade/market';

    const linkData = [
        { title: t('common:homeTitle'), destination: '/', shouldDisplay: true },
        { title: t('common:swapTitle'), destination: '/swap', shouldDisplay: true },
        { title: t('common:tradeTitle'), destination: tradeDestination, shouldDisplay: true },
        { title: t('common:analyticsTitle'), destination: '/analytics', shouldDisplay: true },
        {
            title: t('common:accountTitle'),
            destination: '/account',
            shouldDisplay: shouldDisplayAccountTab,
        },
    ];

    // Most of this functionality can be achieve by using the NavLink instead of Link and accessing the isActive prop on the Navlink. Access to this is needed outside of the link itself for animation purposes, which is why it is being done in this way.

    const routeDisplay = (
        <AnimateSharedLayout>
            <nav
                className={styles.primary_navigation}
                id='primary_navigation'
                data-visible={mobileNavToggle}
            >
                {linkData.map((link, idx) =>
                    link.shouldDisplay ? (
                        <Link
                            className={
                                pathname === link.destination ? styles.active : styles.inactive
                            }
                            to={link.destination}
                            key={idx}
                        >
                            {link.title}

                            {pathname === link.destination && (
                                <motion.div className={styles.underline} layoutId='underline' />
                            )}
                        </Link>
                    ) : null,
                )}
            </nav>
        </AnimateSharedLayout>
    );

    // ----------------------------END OF NAVIGATION FUNCTIONALITY-------------------------------------
    const [showNotificationTable, setShowNotificationTable] = useState(false);

    return (
        <header data-testid={'page-header'} className={styles.primary_header}>
            <Link to='/' className={styles.logo_container}>
                <img src={ambientLogo} alt='ambient' />
                <h1>ambient</h1>
            </Link>
            {/* <div
                className={styles.mobile_nav_toggle}
                style={{ cursor: 'pointer' }}
                aria-controls='primary_navigation'
                aria-expanded={mobileNavToggle}
            >
                <MenuButton
                    isOpen={mobileNavToggle}
                    onClick={handleMobileNavToggle}
                    strokeWidth='2'
                    color='#cdc1ff'
                    transition={{ ease: 'easeOut', duration: 0.2 }}
                    width='24'
                    height='18'
                />
                <span className='sr-only'>Menu</span>
            </div> */}

            {routeDisplay}
            <MobileSidebar />

            <div className={styles.account}>
                <NetworkSelector chainId={chainId} switchChain={switchChain} />
                {(!isAuthenticated || !isWeb3Enabled) && metamaskButton}
                <Account {...accountProps} />
                <NotificationCenter
                    showNotificationTable={showNotificationTable}
                    setShowNotificationTable={setShowNotificationTable}
                    pendingTransactions={pendingTransactions}
                />
            </div>
            {isChainSupported || <SwitchNetwork switchNetworkInMoralis={switchNetworkInMoralis} />}
            {modalOrNull}
        </header>
    );
}
