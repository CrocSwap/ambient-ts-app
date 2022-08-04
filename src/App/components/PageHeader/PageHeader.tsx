/** ***** START: Import React and Dongles *******/
import { NavLink, Link } from 'react-router-dom';
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

/** ***** END: Import Local Files *********/

interface IHeaderProps {
    nativeBalance: string;
    clickLogout: () => void;
    metamaskLocked: boolean;
    ensName: string;
    shouldDisplayAccountTab: boolean;
    chainId: string;
    setFallbackChainId: React.Dispatch<React.SetStateAction<string>>;
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
    const { ensName, shouldDisplayAccountTab, chainId, setFallbackChainId } = props;

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

    // function to authenticate wallet with Moralis server
    const clickLogin = () => {
        console.log('user clicked Login');
        if (!isAuthenticated || !isWeb3Enabled) {
            authenticate({
                provider: 'metamask',
                signingMessage: 'Ambient API Authentication.',
                onSuccess: () => {
                    enableWeb3();
                },
                onError: () => {
                    authenticate({
                        provider: 'metamask',
                        signingMessage: 'Ambient API Authentication.',
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

    // const magicButton = (
    //     <button className={styles.authenticate_button} onClick={openModal}>
    //         Log in with Email
    //     </button>
    // );

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
            <nav
                className={styles.primary_navigation}
                id='primary_navigation'
                data-visible={mobileNavToggle}
            >
                <NavLink
                    to='/'
                    className={({ isActive }) => (isActive ? styles.active : styles.inactive)}
                >
                    {t('common:homeTitle')}
                </NavLink>
                <NavLink
                    to='/swap'
                    className={({ isActive }) => (isActive ? styles.active : styles.inactive)}
                >
                    {t('common:swapTitle')}
                </NavLink>
                {/* <NavLink to='/range2'>Range</NavLink> */}
                <NavLink
                    to={
                        location.pathname.includes('trade/market')
                            ? '/trade/market'
                            : location.pathname.includes('trade/limit')
                            ? '/trade/limit'
                            : location.pathname.includes('trade/range')
                            ? '/trade/range'
                            : location.pathname.includes('trade/edit')
                            ? '/trade/edit'
                            : '/trade/market'
                    }
                    className={({ isActive }) => (isActive ? styles.active : styles.inactive)}
                >
                    {t('common:tradeTitle')}
                </NavLink>
                <NavLink
                    to='/analytics'
                    className={({ isActive }) => (isActive ? styles.active : styles.inactive)}
                >
                    {t('common:analyticsTitle')}
                </NavLink>
                {shouldDisplayAccountTab ? (
                    <NavLink
                        to='/account'
                        className={({ isActive }) => (isActive ? styles.active : styles.inactive)}
                    >
                        {t('common:accountTitle')}
                    </NavLink>
                ) : null}
            </nav>
            {/* <div className={styles.account}>Account Info</div> */}
            {/* <div className={styles.account}>{accountAddress}</div> */}
            <div className={styles.account}>
                {(!isAuthenticated || !isWeb3Enabled) && metamaskButton}
                {/* {(!isAuthenticated || !isWeb3Enabled) && magicButton} */}
                {isAuthenticated && isWeb3Enabled && (
                    <NetworkSelector chainId={chainId} setFallbackChainId={setFallbackChainId} />
                )}
                {/* <div>
                    {Object.keys(lngs).map((lng) => (
                        <button
                            key={lng}
                            style={{
                                fontWeight: i18n.resolvedLanguage === lng ? 'bold' : 'normal',
                            }}
                            type='submit'
                            onClick={() => i18n.changeLanguage(lng)}
                        >
                            {lngs[lng].nativeName}
                        </button>
                    ))}
                </div> */}
                <Account {...accountProps} />
            </div>

            {modalOrNull}
        </header>
    );
}
