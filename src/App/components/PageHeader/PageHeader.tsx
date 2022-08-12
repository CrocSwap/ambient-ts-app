/** ***** START: Import React and Dongles *******/
import { Link } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useMoralis } from 'react-moralis';
import { useTranslation } from 'react-i18next';

/** ***** END: Import React and Dongles *********/

/** ***** START: Import Local Files *******/
import styles from './PageHeader.module.css';
import { useRive, useStateMachineInput } from 'rive-react';
import Account from './Account/Account';
import NetworkSelector from './NetworkSelector/NetworkSelector';
import trimString from '../../../utils/functions/trimString';
import ambientLogo from '../../../assets/images/logos/ambient_logo.svg';

import { useModal } from '../../../components/Global/Modal/useModal';
import Modal from '../../../components/Global/Modal/Modal';
import MagicLogin from './MagicLogin';
import SwitchNetwork from '../../../components/Global/SwitchNetworkAlert/SwitchNetwork/SwitchNetwork';

import { motion, AnimateSharedLayout } from 'framer-motion';

/** ***** END: Import Local Files *********/

interface IHeaderProps {
    nativeBalance: string;
    clickLogout: () => void;
    metamaskLocked: boolean;
    ensName: string;
    shouldDisplayAccountTab: boolean;
    chainId: string;
    setFallbackChainId: React.Dispatch<React.SetStateAction<string>>;
    isChainValid: boolean;
}

// interface lgnData {
//     name: keyof typeof lngs;
// }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// const lngs: any = {
//     en: { nativeName: 'English' },
//     zh: { nativeName: '中文' },
//     kr: { nativeName: '한국어' },
// };

export default function PageHeader(props: IHeaderProps): React.ReactElement<IHeaderProps> {
    const { ensName, shouldDisplayAccountTab, chainId, setFallbackChainId, isChainValid } = props;

    const { user, account, enableWeb3, isWeb3Enabled, authenticate, isAuthenticated } =
        useMoralis();

    const { t } = useTranslation();

    const [isModalOpen, openModal, closeModal] = useModal();
    const modalTitle = 'Log in with Email';

    const mainModal = (
        <Modal onClose={closeModal} title={modalTitle}>
            <MagicLogin closeModal={closeModal} />
        </Modal>
    );

    const modalOrNull = isModalOpen ? mainModal : null;

    const signingMessage = `Welcome to Ambient Finance!

Click to sign in and accept the Ambient Terms of Service: https://ambient-finance.netlify.app/tos

This request will not trigger a blockchain transaction or cost any gas fees.

Your authentication status will reset on logout.`;

    // function to authenticate wallet with Moralis server
    const clickLogin = () => {
        console.log('user clicked Login');
        if (!isAuthenticated || !isWeb3Enabled) {
            authenticate({
                provider: 'metamask',
                signingMessage: signingMessage,
                // signingMessage: 'Ambient API Authentication.',
                onSuccess: () => {
                    enableWeb3();
                },
                onError: () => {
                    authenticate({
                        provider: 'metamask',
                        signingMessage: signingMessage,
                        onSuccess: () => {
                            enableWeb3;
                            // alert('🎉');
                        },
                    });
                },
            });
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            // console.log('waited 1 second');
            reenableWeb3();
        }, 100);
        return () => clearTimeout(timer);
    }, [user, account, props.metamaskLocked]);

    const reenableWeb3 = useCallback(async () => {
        // console.log('firing reenableWeb3');
        try {
            if (user && !account && !props.metamaskLocked) {
                // console.log('enabling web3');
                // console.log(props.metamaskLocked);
                await enableWeb3();
            }
        } catch (err) {
            console.warn(`Could not automatically bridge Moralis to wallet. Error follows: ${err}`);
        }
    }, [user, account, props.metamaskLocked]);

    // rive component
    const STATE_MACHINE_NAME = 'Basic State Machine';
    const INPUT_NAME = 'Switch';

    const { rive, RiveComponent } = useRive({
        src: './hamburger.riv',
        stateMachines: STATE_MACHINE_NAME,
        autoplay: true,
    });

    const onClickInput = useStateMachineInput(rive, STATE_MACHINE_NAME, INPUT_NAME);

    // end of rive component

    // Page Header states
    const [mobileNavToggle, setMobileNavToggle] = useState<boolean>(false);

    // End of Page Header States

    // Page Header functions
    function handleMobileNavToggle() {
        setMobileNavToggle(!mobileNavToggle);
        onClickInput?.fire();
    }

    // -----------------SWITCH NETWORK FUNCTIONALITY--------------------------------------
    // eslint-disable-next-line
    const [showSwitchNetwork, setShowSwitchNetwork] = useState(true);
    // eslint-disable-next-line
    // const openSwitchNetwork = useCallback(() => {
    //     setShowSwitchNetwork(true);
    // }, [setShowSwitchNetwork]);
    // eslint-disable-next-line
    const closeSwitchNetwork = useCallback(() => {
        setShowSwitchNetwork(false);
    }, [setShowSwitchNetwork]);

    const switchNetWorkOrNull = isChainValid ? null : (
        <SwitchNetwork
            onClose={closeSwitchNetwork}
            chainId={chainId}
            setFallbackChainId={setFallbackChainId}
        />
    );

    // -----------------END OF SWITCH NETWORK FUNCTIONALITY--------------------------------------
    const accountAddress = isAuthenticated && account ? trimString(account, 6, 6) : '';

    const accountProps = {
        nativeBalance: props.nativeBalance,
        accountAddress: accountAddress,
        accountAddressFull: isAuthenticated && account ? account : '',
        ensName: ensName,
        isAuthenticated: isAuthenticated,
        isWeb3Enabled: isWeb3Enabled,
        clickLogout: props.clickLogout,
        openModal: openModal,
        chainId: chainId,
        setFallbackChainId: setFallbackChainId,
    };

    // End of Page Header Functions

    const metamaskButton = (
        <button className={styles.authenticate_button} onClick={clickLogin}>
            Connect Metamask
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

    return (
        <header data-testid={'page-header'} className={styles.primary_header}>
            {/* <div className={styles.header_gradient}> </div> */}
            <Link to='/' className={styles.logo_container}>
                <img src={ambientLogo} alt='ambient' />
                <h1>ambient</h1>
            </Link>
            <div
                className={styles.mobile_nav_toggle}
                aria-controls='primary_navigation'
                aria-expanded={mobileNavToggle}
            >
                <RiveComponent onClick={handleMobileNavToggle} />
                <span className='sr-only'>Menu</span>
            </div>

            {routeDisplay}

            <div className={styles.account}>
                {<NetworkSelector chainId={chainId} setFallbackChainId={setFallbackChainId} />}
                {(!isAuthenticated || !isWeb3Enabled) && metamaskButton}

                <Account {...accountProps} />
            </div>
            {/* <SwitchNetwork showSwitchNetwork={showSwitchNetwork} /> */}
            {switchNetWorkOrNull}
            {modalOrNull}
        </header>
    );
}
