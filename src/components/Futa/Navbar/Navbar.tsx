// Imports
import { useWeb3ModalAccount } from '@web3modal/ethers/react';
import { motion } from 'framer-motion';
import { useContext, useEffect, useRef, useState } from 'react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { FiMoreHorizontal } from 'react-icons/fi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    DISCORD_LINK,
    DOCS_LINK,
    TWITTER_LINK,
} from '../../../ambient-utils/constants';
import {
    chainNumToString,
    openInNewTab,
    trimString,
} from '../../../ambient-utils/dataLayer';
import NetworkSelector from '../../../App/components/PageHeader/NetworkSelector/NetworkSelector';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { AuctionsContext } from '../../../contexts/AuctionsContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { useFutaHomeContext } from '../../../contexts/Futa/FutaHomeContext';
import { GraphDataContext } from '../../../contexts/GraphDataContext';
import { ReceiptContext } from '../../../contexts/ReceiptContext';
import { TokenBalanceContext } from '../../../contexts/TokenBalanceContext';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { TradeTableContext } from '../../../contexts/TradeTableContext';
import { TradeTokenContext } from '../../../contexts/TradeTokenContext';
import { UserDataContext } from '../../../contexts/UserDataContext';
import {
    linkGenMethodsIF,
    swapParamsIF,
    useLinkGen,
} from '../../../utils/hooks/useLinkGen';
import { useMediaQuery } from '../../../utils/hooks/useMediaQuery';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import Toggle from '../../Form/Toggle';
import NotificationCenter from '../../Global/NotificationCenter/NotificationCenter';
import TutorialOverlayUrlBased from '../../Global/TutorialOverlay/TutorialOverlayUrlBased';
import styles from './Navbar.module.css';

// Animation Variants
const dropdownVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
        height: 'auto',
        opacity: 1,
        transition: {
            duration: 0.3,
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
    exit: {
        height: 0,
        opacity: 0,
        transition: { duration: 0.3 },
    },
};

const dropdownItemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
};

export default function Navbar() {
    // States
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [replayTutorial, setReplayTutorial] = useState(false);
    const tutorialBtnRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();
    const location = useLocation();
    const currentLocationIsHome = location.pathname == '/';

    // Context
    const { isConnected } = useWeb3ModalAccount();
    const { isUserConnected, disconnectUser, ensName, userAddress } =
        useContext(UserDataContext);
    const { setCrocEnv } = useContext(CrocEnvContext);
    const {
        baseToken: {
            setBalance: setBaseTokenBalance,
            setDexBalance: setBaseTokenDexBalance,
        },
        quoteToken: {
            setBalance: setQuoteTokenBalance,
            setDexBalance: setQuoteTokenDexBalance,
        },
    } = useContext(TradeTokenContext);
    const { resetTokenBalances } = useContext(TokenBalanceContext);
    const { resetUserGraphData } = useContext(GraphDataContext);
    const { resetReceiptData } = useContext(ReceiptContext);
    const { setShowAllData } = useContext(TradeTableContext);
    const { tokenA, tokenB } = useContext(TradeDataContext);
    const {
        walletModal: { open: openWalletModal },
    } = useContext(AppStateContext);

    const { selectedTicker } = useContext(AuctionsContext);

    const {
        showHomeVideoLocalStorage,
        setShowHomeVideoLocalStorage,
        showTutosLocalStorage,
        bindShowTutosLocalStorage,
        skipLandingPage,
        setSkipLandingPage,
        setShowLandingPageTemp,
    } = useFutaHomeContext();

    // set page title
    useEffect(() => {
        const path = location.pathname;
        const pathNoLeadingSlash = path.slice(1);
        const isAddressEns = pathNoLeadingSlash?.endsWith('.eth');
        const isAddressHex =
            (pathNoLeadingSlash?.startsWith('0x') &&
                pathNoLeadingSlash?.length == 42) ||
            (pathNoLeadingSlash?.startsWith('account/0x') &&
                pathNoLeadingSlash?.length == 50);
        const isPathValidAddress = path && (isAddressEns || isAddressHex);
        if (pathNoLeadingSlash === '') {
            document.title = 'FU/TA | Fully Universal Ticker Auction';
        } else if (pathNoLeadingSlash === 'account') {
            document.title = 'FU/TA | My Account';
        } else if (isPathValidAddress) {
            const pathNoPrefix = pathNoLeadingSlash.replace(/account\//, '');
            const pathNoPrefixDecoded = decodeURIComponent(pathNoPrefix);
            const ensNameOrAddressTruncated = isAddressEns
                ? pathNoPrefixDecoded.length > 15
                    ? trimString(pathNoPrefixDecoded, 10, 3, '…')
                    : pathNoPrefixDecoded
                : trimString(pathNoPrefixDecoded, 6, 0, '…');
            document.title = `FUTA | ${ensNameOrAddressTruncated}`;
        } else if (location.pathname.includes('create')) {
            document.title = 'FUTA | Create Ticker';
        } else if (pathNoLeadingSlash === 'auctions') {
            document.title = 'FUTA | Auctions';
        } else if (location.pathname.includes('auctions/v')) {
            if (selectedTicker !== undefined) {
                document.title = `FUTA | ${selectedTicker}`;
            } else {
                document.title = 'FUTA | Auctions';
            }
        } else if (location.pathname.includes('404')) {
            document.title = 'FUTA | 404';
        } else if (location.pathname.includes('swap')) {
            document.title = 'FUTA | Swap';
        } else {
            document.title = 'FUTA | Fully Universal Ticker Auction';
        }
    }, [location.pathname, selectedTicker]);

    // Refs
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Handlers
    const clickOutsideHandler = () => {
        setIsDropdownOpen(false);
    };
    const accountAddress =
        isUserConnected && userAddress ? trimString(userAddress, 6, 6) : '';

    const clickLogout = async () => {
        setCrocEnv(undefined);
        setBaseTokenBalance('');
        setQuoteTokenBalance('');
        setBaseTokenDexBalance('');
        setQuoteTokenDexBalance('');
        resetUserGraphData();
        resetReceiptData();
        resetTokenBalances();
        setShowAllData(true);
        disconnectUser();
    };

    // Custom Hooks
    useOnClickOutside(dropdownRef, clickOutsideHandler);
    const desktopScreen = useMediaQuery('(min-width: 768px)');

    // Data
    const dropdownData = [
        { label: 'docs', link: DOCS_LINK },
        { label: 'twitter', link: TWITTER_LINK },
        { label: 'discord', link: DISCORD_LINK },
        { label: 'legal & privacy', link: '/privacy' },
        { label: 'terms of service', link: '/terms' },
    ];

    const linkGenSwap: linkGenMethodsIF = useLinkGen('swap');

    const swapParams: swapParamsIF = {
        chain: chainNumToString(tokenA.chainId),
        tokenA: tokenA.address,
        tokenB: tokenB.address,
    };

    const navbarLinks = [
        {
            label: 'Auctions',
            link: selectedTicker
                ? `/auctions/v1/${selectedTicker}`
                : '/auctions',
            id: 'navbar_auctions',
        },
        {
            label: 'Swap',
            link: linkGenSwap.getFullURL(swapParams),
            id: 'navbar_swap',
        },
        {
            label: 'Account',
            link: '/account',
            id: 'navbar_account',
        },
        {
            label: 'Create',
            link: '/create',
            id: 'navbar_create',
        },
    ];

    const connectWagmiButton = (
        <button
            id='connect_wallet_button_page_header'
            onClick={openWalletModal}
            className={styles.connectButton}
        >
            {desktopScreen ? 'CONNECT WALLET' : 'CONNECT'}
        </button>
    );

    const skipAnimationToggle = (
        <motion.div
            variants={dropdownItemVariants}
            className={styles.skipAnimationContainer}
        >
            <p>Skip Home Animation</p>
            <Toggle
                isOn={!showHomeVideoLocalStorage}
                handleToggle={() =>
                    setShowHomeVideoLocalStorage(!showHomeVideoLocalStorage)
                }
                Width={36}
                id='skip_home_video_futa_toggle'
                disabled={false}
            />
        </motion.div>
    );
    const skipLandingPageToggle = (
        <motion.div
            variants={dropdownItemVariants}
            className={styles.skipAnimationContainer}
        >
            <p>Skip Home Page</p>
            <Toggle
                isOn={skipLandingPage}
                handleToggle={() => setSkipLandingPage(!skipLandingPage)}
                Width={36}
                id='skip landing page_futa_toggle'
                disabled={false}
            />
        </motion.div>
    );

    const showTutosToggle = (
        <motion.div
            variants={dropdownItemVariants}
            className={styles.skipAnimationContainer}
        >
            <p>Show Tutorials</p>
            <Toggle
                isOn={showTutosLocalStorage}
                handleToggle={() =>
                    bindShowTutosLocalStorage(!showTutosLocalStorage)
                }
                Width={36}
                id='show_tutos_futa_toggle'
                disabled={false}
            />
        </motion.div>
    );

    const tabLinks = () => {
        return (
            <ul className={styles.navTabs} role='tablist'>
                {navbarLinks.map((navLink) => (
                    <li key={navLink.id} className={styles.navItem}>
                        <div
                            className={`${styles.navLink} ${
                                location.pathname.includes(navLink.link)
                                    ? styles.active
                                    : styles.not_active
                            }`}
                            onMouseDown={() => navigate(navLink.link)}
                            role='link'
                            tabIndex={0} // Makes the div focusable for accessibility
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    navigate(navLink.link);
                                }
                            }}
                        >
                            <span className={styles.slantedText}>
                                {navLink.label}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <>
            <div
                className={`${styles.container} ${currentLocationIsHome && styles.fixedPositioned}`}
            >
                <div className={styles.logoContainer}>
                    <Link to='/' onClick={() => setShowLandingPageTemp(true)}>
                        <h3>FU/TA</h3>
                    </Link>
                    {desktopScreen && tabLinks()}
                </div>
                <div className={styles.rightContainer}>
                    {!desktopScreen && <NetworkSelector customBR={'50%'} />}
                    <div
                        className={styles.tutorialBtn}
                        ref={tutorialBtnRef}
                        onClick={() => setReplayTutorial(true)}
                    >
                        {' '}
                        <AiOutlineQuestionCircle /> Help
                    </div>
                    {!isUserConnected && connectWagmiButton}
                    <NotificationCenter />
                    <div className={styles.moreContainer} ref={dropdownRef}>
                        <FiMoreHorizontal
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        />
                        {/* <AnimatePresence> */}
                        {isDropdownOpen && (
                            <motion.div
                                className={styles.dropdownMenu}
                                initial='hidden'
                                animate='visible'
                                exit='exit'
                                variants={dropdownVariants}
                            >
                                {dropdownData.map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        variants={dropdownItemVariants}
                                        className={styles.linkContainer}
                                        onClick={() => {
                                            openInNewTab(item.link);

                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        <div style={{ cursor: 'pointer' }}>
                                            {item.label}
                                        </div>
                                    </motion.div>
                                ))}
                                <motion.p
                                    className={styles.version}
                                    variants={dropdownItemVariants}
                                >
                                    {isConnected &&
                                        `Connected address: ${
                                            ensName ? ensName : accountAddress
                                        }`}
                                </motion.p>
                                {skipAnimationToggle}
                                {skipLandingPageToggle}
                                {showTutosToggle}
                                <motion.p
                                    className={styles.version}
                                    variants={dropdownItemVariants}
                                >
                                    Version 1.0.0
                                </motion.p>
                                <motion.button
                                    className={styles.connectButton}
                                    onClick={
                                        isUserConnected
                                            ? clickLogout
                                            : openWalletModal
                                    }
                                >
                                    {isUserConnected
                                        ? 'LOG OUT'
                                        : 'CONNECT WALLET'}
                                </motion.button>
                            </motion.div>
                        )}
                        {/* </AnimatePresence> */}
                    </div>
                </div>
            </div>
            <TutorialOverlayUrlBased
                replayTutorial={replayTutorial}
                setReplayTutorial={setReplayTutorial}
                tutorialBtnRef={tutorialBtnRef}
            />
        </>
    );
}
