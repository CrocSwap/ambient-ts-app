/** ***** START: Import React and Dongles *******/
import { NavLink } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useMoralis } from 'react-moralis';
/** ***** END: Import React and Dongles *********/

/** ***** START: Import Local Files *******/
import styles from './PageHeader.module.css';
import { useRive, useStateMachineInput } from 'rive-react';
import Account from './Account/Account';
import NetworkSelector from './NetworkSelector/NetworkSelector';
import truncateAddress from '../../../utils/truncateAddress';
import ambientLogo from '../../../assets/images/logos/ambient_logo.svg';

/** ***** END: Import Local Files *********/

interface IHeaderProps {
    nativeBalance: string;
    clickLogout: () => void;
    metamaskLocked: boolean;
}

export default function PageHeader(props: IHeaderProps): React.ReactElement<IHeaderProps> {
    const { user, account, enableWeb3, isWeb3Enabled, authenticate, isAuthenticated } =
        useMoralis();

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

    const accountAddress = isAuthenticated && account ? truncateAddress(account, 18) : '';

    const accountProps = {
        nativeBalance: props.nativeBalance,
        accountAddress: accountAddress,
        isAuthenticated: isAuthenticated,
        isWeb3Enabled: isWeb3Enabled,
        clickLogout: props.clickLogout,
    };

    // End of Page Header Functions

    const loginButton = (
        <button className={styles.authenticate_button} onClick={clickLogin}>
            Connect Wallet
        </button>
    );

    return (
        <header data-testid={'page-header'} className={styles.primary_header}>
            <div className={styles.header_gradient}> </div>
            <div className={styles.logo_container}>
                <img src={ambientLogo} alt='ambient' />
                <h1>ambient</h1>
            </div>
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
                <NavLink to='/'>Home</NavLink>
                <NavLink to='/swap'>Swap</NavLink>
                {/* <NavLink to='/range2'>Range</NavLink> */}
                <NavLink to='/trade'>Trade</NavLink>
                <NavLink to='/analytics'>Analytics</NavLink>
                <NavLink to='/portfolio'>Portfolio</NavLink>
            </nav>
            {/* <div className={styles.account}>Account Info</div> */}
            {/* <div className={styles.account}>{accountAddress}</div> */}
            <div className={styles.account}>
                {(!isAuthenticated || !isWeb3Enabled) && loginButton}
                {isAuthenticated && isWeb3Enabled && <NetworkSelector />}
                <Account {...accountProps} />
            </div>
        </header>
    );
}
