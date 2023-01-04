// START: Import React and Dongles
import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimateSharedLayout } from 'framer-motion';

// START: Import JSX Elements
import Account from './Account/Account';
// import MagicLogin from './MagicLogin';
import NetworkSelector from './NetworkSelector/NetworkSelector';
import SwitchNetwork from '../../../components/Global/SwitchNetworkAlert/SwitchNetwork/SwitchNetwork';
// import Modal from '../../../components/Global/Modal/Modal';

// START: Import Local Files
import styles from './PageHeader.module.css';
import trimString from '../../../utils/functions/trimString';
// import ambientLogo from '../../../assets/images/logos/ambient_logo.svg';
import headerLogo from '../../../assets/images/logos/header_logo.svg';
// import { useModal } from '../../../components/Global/Modal/useModal';
import { useUrlParams } from './useUrlParams';
import MobileSidebar from '../../../components/Global/MobileSidebar/MobileSidebar';
import NotificationCenter from '../../../components/Global/NotificationCenter/NotificationCenter';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { useAccount, useDisconnect, useEnsName } from 'wagmi';

interface HeaderPropsIF {
    isUserLoggedIn: boolean | undefined;
    // nativeBalance: string | undefined;
    clickLogout: () => void;
    // metamaskLocked: boolean;
    ensName: string;
    shouldDisplayAccountTab: boolean | undefined;
    chainId: string;
    isChainSupported: boolean;
    openWagmiModalWallet: () => void;

    isMobileSidebarOpen: boolean;
    setIsMobileSidebarOpen: Dispatch<SetStateAction<boolean>>;
    lastBlockNumber: number;

    openGlobalModal: (content: React.ReactNode) => void;

    closeGlobalModal: () => void;

    isAppOverlayActive: boolean;
    poolPriceDisplay: number | undefined;
    setIsAppOverlayActive: Dispatch<SetStateAction<boolean>>;
    switchTheme: () => void;
    theme: string;
}

export default function PageHeader(props: HeaderPropsIF) {
    const {
        // isUserLoggedIn,
        // ensName,
        // nativeBalance,
        // clickLogout,
        // metamaskLocked,
        // shouldDisplayAccountTab,
        chainId,
        isChainSupported,
        // openMoralisModalWallet,
        openWagmiModalWallet,
        lastBlockNumber,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        isAppOverlayActive,
        setIsAppOverlayActive,
        switchTheme,
        theme,
        poolPriceDisplay,
    } = props;

    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const { data: ensName } = useEnsName({ address });

    const { t } = useTranslation();

    // const [isModalOpen, openModal, closeModal] = useModal();
    // const modalTitle = 'Log in with Email';

    // const mainModal = (
    //     <Modal onClose={closeModal} title={modalTitle}>
    //         <MagicLogin closeModal={closeModal} />
    //     </Modal>
    // );

    // const [connectButtonDelayElapsed, setConnectButtonDelayElapsed] = useState(false);

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         setConnectButtonDelayElapsed(true);
    //     }, 3000);
    //     return () => clearTimeout(timer);
    // }, []);

    // const modalOrNull = isModalOpen ? mainModal : null;

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         reenableWeb3();
    //     }, 100);
    //     return () => clearTimeout(timer);
    // }, [user, account, metamaskLocked]);

    // const reenableWeb3 = useCallback(async () => {
    //     // console.log('enabling web3');
    //     try {
    //         if (user && !account && !metamaskLocked) {
    //             await enableWeb3();
    //         }
    //     } catch (err) {
    //         console.warn(`Could not automatically bridge Moralis to wallet. Error follows: ${err}`);
    //     }
    // }, [user, account, metamaskLocked]);

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
    const accountAddress = isConnected && address ? trimString(address, 6, 6) : '';
    const userData = useAppSelector((state) => state.userData);

    const connectedUserNativeToken = userData.tokens.nativeToken;

    const accountProps = {
        nativeBalance: connectedUserNativeToken?.combinedBalanceDisplayTruncated,
        accountAddress: accountAddress,
        accountAddressFull: isConnected && address ? address : '',
        ensName: ensName || '',
        isUserLoggedIn: isConnected,
        clickLogout: disconnect,
        // openModal: openModal,
        chainId: chainId,
        isAppOverlayActive: isAppOverlayActive,
        setIsAppOverlayActive: setIsAppOverlayActive,

        switchTheme: switchTheme,
        theme: theme,
    };

    // End of Page Header Functions

    // const connectMoralisButton = (
    //     <button className={styles.authenticate_button} onClick={() => openMoralisModalWallet()}>
    //         Connect Moralis
    //     </button>
    // );

    const connectWagmiButton = (
        <button className={styles.authenticate_button} onClick={() => openWagmiModalWallet()}>
            Connect Wallet
        </button>
    );
    // ----------------------------NAVIGATION FUNCTIONALITY-------------------------------------

    const location = useLocation();

    const urlParams = useUrlParams();

    const tradeData = useAppSelector((state) => state.tradeData);

    const baseSymbol = tradeData.baseToken.symbol;
    const quoteSymbol = tradeData.quoteToken.symbol;
    const isDenomBase = tradeData.isDenomBase;

    const poolPriceDisplayWithDenom = poolPriceDisplay
        ? isDenomBase
            ? 1 / poolPriceDisplay
            : poolPriceDisplay
        : undefined;

    const truncatedPoolPrice =
        !poolPriceDisplayWithDenom ||
        poolPriceDisplayWithDenom === Infinity ||
        poolPriceDisplayWithDenom === 0
            ? ''
            : // ? '…'
            poolPriceDisplayWithDenom < 2
            ? poolPriceDisplayWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : poolPriceDisplayWithDenom.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    useEffect(() => {
        const path = location.pathname;

        const pathNoLeadingSlash = path.slice(1);
        // console.log({ pathNoLeadingSlash });

        const isAddressEns = pathNoLeadingSlash?.endsWith('.eth');
        const isAddressHex =
            pathNoLeadingSlash?.startsWith('0x') && pathNoLeadingSlash?.length == 42;

        const isPathValidAddress = path && (isAddressEns || isAddressHex);
        // console.log({ isPathValidAddress });

        if (pathNoLeadingSlash === 'account') {
            document.title = 'My Account ~ ambient.finance';
        } else if (isPathValidAddress) {
            const ensNameOrAddressTruncated = isAddressEns
                ? pathNoLeadingSlash.length > 15
                    ? trimString(pathNoLeadingSlash, 10, 3, '…')
                    : pathNoLeadingSlash
                : trimString(pathNoLeadingSlash, 6, 0, '…');
            document.title = `${ensNameOrAddressTruncated} ~ ambient.finance`;
        } else if (location.pathname.includes('swap') || location.pathname.includes('trade')) {
            document.title = isDenomBase
                ? `${baseSymbol}/${quoteSymbol} ${truncatedPoolPrice} ~ ambient.finance`
                : `${quoteSymbol}/${baseSymbol} ${truncatedPoolPrice} ~ ambient.finance`;
        } else {
            document.title = 'Home ~ ambient.finance';
        }
    }, [baseSymbol, quoteSymbol, isDenomBase, location, truncatedPoolPrice]);

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
        { title: t('common:swapTitle'), destination: '/swap' + urlParams, shouldDisplay: true },
        {
            title: t('common:tradeTitle'),
            destination: tradeDestination + urlParams,
            shouldDisplay: true,
        },
        { title: t('common:analyticsTitle'), destination: '/analytics', shouldDisplay: false },
        {
            title: t('common:accountTitle'),
            destination: '/account',
            shouldDisplay: isConnected,
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
                                location.pathname === link.destination
                                    ? styles.active
                                    : styles.inactive
                            }
                            to={link.destination}
                            key={idx}
                        >
                            {link.title}

                            {location.pathname === link.destination && (
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
                <img src={headerLogo} alt='ambient' />
                {/* <h1>ambient</h1> */}
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
            <div>
                <MobileSidebar
                    lastBlockNumber={lastBlockNumber}
                    chainId={chainId}
                    isMobileSidebarOpen={isMobileSidebarOpen}
                    setIsMobileSidebarOpen={setIsMobileSidebarOpen}
                    theme={theme}
                    switchTheme={switchTheme}
                />
                <div className={styles.account}>
                    <NetworkSelector chainId={chainId} />
                    {/* {connectButtonDelayElapsed && !isUserLoggedIn && connectMoralisButton} */}
                    {!isConnected && connectWagmiButton}
                    <Account {...accountProps} />
                    <NotificationCenter
                        showNotificationTable={showNotificationTable}
                        setShowNotificationTable={setShowNotificationTable}
                        lastBlockNumber={lastBlockNumber}
                    />
                </div>
            </div>
            {isChainSupported || <SwitchNetwork />}
            {/* {modalOrNull} */}
        </header>
    );
}
