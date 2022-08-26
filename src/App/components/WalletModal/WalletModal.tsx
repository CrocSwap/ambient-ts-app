// START: Import React and Dongles
import { useEffect, useMemo, useState } from 'react';
import { Moralis } from 'moralis';
import { AuthenticateOptions } from 'react-moralis/lib/hooks/core/useMoralis/_useMoralisAuth';
import { Web3EnableOptions } from 'react-moralis/lib/hooks/core/useMoralis/_useMoralisWeb3';

// START: Import Local Files
import styles from './WalletModal.module.css';
import Modal from '../../../components/Global/Modal/Modal';
import Button from '../../../components/Global/Button/Button';
import { useTermsOfService } from '../../hooks/useTermsOfService';
import validateEmail from './validateEmail';
import authenticateMetamask from '../../../utils/functions/authenticateMetamask';
import authenticateMagic from '../../../utils/functions/authenticateMagic';
import { HiOutlineMail } from 'react-icons/hi';
import WalletButton from './WalletButton/WalletButton';
import metamaskLogo from '../../../assets/images/logos/MetaMask_Fox.svg';
import magicLoginImage from '../../../assets/images/logos/magicLogin.png';
import WaveAnimation from '../../../components/Global/LoadingAnimations/WaveAnimation/WaveAnimation';
import CircleLoader from '../../../components/Global/LoadingAnimations/CircleLoader/CircleLoader';

interface WalletModalPropsIF {
    closeModalWallet: () => void;
    isAuthenticating: boolean;
    isAuthenticated: boolean;
    isWeb3Enabled: boolean;
    authenticate: (
        options?: AuthenticateOptions | undefined,
    ) => Promise<Moralis.User<Moralis.Attributes> | undefined>;
    enableWeb3: (
        options?: Web3EnableOptions | undefined,
    ) => Promise<Moralis.Web3Provider | undefined>;
    // authError:
}

export default function WalletModal(props: WalletModalPropsIF) {
    const {
        closeModalWallet,
        isAuthenticating,
        isAuthenticated,
        isWeb3Enabled,
        authenticate,
        enableWeb3,
    } = props;

    // close the Connect Wallet modal only when authentication completes
    useEffect(() => {
        isAuthenticated && closeModalWallet();
    }, [isAuthenticating]);

    const { tosText, acceptToS } = useTermsOfService();

    const [page, setPage] = useState('wallets');
    const [email, setEmail] = useState('');

    const learnAboutWalletsContent = (
        <div className={styles.learn_container}>
            <div>New to Ethereum?</div>
            <a href='#'>Learn more about Wallets</a>
        </div>
    );

    //     const connectToWalletTOSContent = (
    //         <div className={styles.tos_content}>
    //             By connecting a wallet, you agree to Ambient Finance’s
    // <a href="#">Terms of Service</a>

    //             , Magic&#39s
    //             <a href="#">Terms of Service & Privacy Policy</a>

    //             , and acknowledge that you have read and understand the Ambient
    //             <a href="#">Protocol Disclaimer </a>

    //         </div>
    //     )

    const handleMetamaskAuthentication = () => {
        setPage('metamaskPending');
        authenticateMetamask(isAuthenticated, isWeb3Enabled, authenticate, enableWeb3, () =>
            setPage('metamaskError'),
        );
        acceptToS();
    };

    // Right now, we only have one wallet but eventually, we will need to add multiple in here.
    const walletsData = [
        { name: 'Metamask', action: handleMetamaskAuthentication, logo: metamaskLogo },
    ];

    const walletsDisplay = (
        <div>
            {walletsData.map((wallet, idx) => (
                <WalletButton
                    title={wallet.name}
                    action={wallet.action}
                    key={idx}
                    logo={wallet.logo}
                />
            ))}
        </div>
    );

    const walletsPage = useMemo(
        () => (
            <div className={styles.main_container}>
                <section>
                    {walletsDisplay}
                    <button className={styles.email_button} onClick={() => setPage('magicLogin')}>
                        <HiOutlineMail size={20} color='#EBEBFF' />
                        Connect with Email
                    </button>
                </section>

                {learnAboutWalletsContent}
            </div>
        ),
        [],
    );

    const metamaskPendingPage = (
        <div className={styles.metamask_pending_container}>
            <CircleLoader size='5rem' />
            <p>
                Check the Metamask extension in your browser for notifications. Make sure your
                browser is not blocking pop-up windows.
            </p>
        </div>
    );

    const metamaskErrorPage = (
        <>
            <p>
                Check the Metamask extension in your browser for notifications, or click &quot;Try
                Again&quot;. You can also click the left arrow above to choose a different wallet.
            </p>
            <Button
                title='Try Again'
                action={() => {
                    setPage('metamaskPending');
                    authenticateMetamask(
                        isAuthenticated,
                        isWeb3Enabled,
                        authenticate,
                        enableWeb3,
                        () => setPage('metamaskError'),
                    );
                    acceptToS();
                }}
            />
        </>
    );

    const magicLoginPage = useMemo(() => {
        const [isValid, message] = validateEmail(email);
        return (
            <div className={styles.magic_login_container}>
                <section>
                    <h2>Create a wallet and authenticate using your email</h2>
                    <div className={styles.magic_logic_input_container}>
                        <input
                            type='email'
                            className='input'
                            defaultValue={email}
                            placeholder='Enter your email address'
                            required
                            onChange={(e) => setEmail(e.target.value.trim())}
                        />
                        <HiOutlineMail size={20} color='#EBEBFF' />
                    </div>
                    <img src={magicLoginImage} alt='magic login icon' />

                    <Button
                        title={message}
                        disabled={!isValid}
                        action={() => {
                            authenticateMagic(email, authenticate, () =>
                                setPage('magicLoginPending'),
                            );
                            acceptToS();
                        }}
                    />
                </section>
                <div onClick={() => setPage('wallets')} className={styles.different_wallet}>
                    Use a different wallet
                </div>
                <button onClick={() => setPage('metamaskPending')}>Metamask Pending</button>
                {/* {connectToWalletTOSContent} */}
            </div>
        );
    }, [email]);

    const magicLoginPendingPage = (
        <>
            <p>The Magic Authentication system will launch in one moment!</p>
        </>
    );

    const activeContent = useMemo(() => {
        switch (page) {
            case 'wallets':
                return walletsPage;
            case 'metamaskPending':
                return metamaskPendingPage;
            case 'metamaskError':
                return metamaskErrorPage;
            case 'magicLogin':
                return magicLoginPage;
            case 'magicLoginPending':
                return magicLoginPendingPage;
            default:
                magicLoginPage;
        }
    }, [page, email]);

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
            case 'wallets':
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
                footer={tosText}
            >
                {activeContent}
            </Modal>
        </div>
    );
}
