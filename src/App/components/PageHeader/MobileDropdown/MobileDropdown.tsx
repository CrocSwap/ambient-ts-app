import { useCallback, useContext, useState } from 'react';
import {
    AppStateContext,
    ChainDataContext,
    CrocEnvContext,
    GraphDataContext,
    ReceiptContext,
    TokenBalanceContext,
    TradeTableContext,
    TradeTokenContext,
    UserDataContext,
} from '../../../../contexts';
import styles from './MobileDropdown.module.css';
import { openInNewTab, trimString } from '../../../../ambient-utils/dataLayer';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import UserProfileCard from '../UserMenu/UserProfileCard';
import WalletDropdown from '../UserMenu/WalletDropdown/WalletDropdown';
// import LevelDropdown from '../Account/LevelDropdown/LevelDropdown';
import UserLevelDisplay from '../../../../components/Global/LevelsCard/UserLevelDisplay';
import { Link } from 'react-router-dom';
import { LogoutButton } from '../../../../components/Global/LogoutButton/LogoutButton';
import { CgProfile } from 'react-icons/cg';

import {
    DISCORD_LINK,
    DOCS_LINK,
    MEDIUM_LINK,
    TWITTER_LINK,
} from '../../../../ambient-utils/constants';
import { SiGitbook } from 'react-icons/si';
import { AiFillTwitterCircle } from 'react-icons/ai';
import { FaDiscord, FaQuestion } from 'react-icons/fa';
import { BsCurrencyExchange, BsMedium } from 'react-icons/bs';
import { RiSpyFill } from 'react-icons/ri';
import { IoDocumentTextSharp } from 'react-icons/io5';
import { useTermsAgreed } from '../../../hooks/useTermsAgreed';
import NavbarDropdownItem from '../NavbarDropdownMenu/NavbarDropdownItem';
import ExchangeBalance from '../../../../components/Portfolio/ExchangeBalance/ExchangeBalance';
import { IoIosSettings } from 'react-icons/io';
import { MdAccountCircle } from 'react-icons/md';
interface navDataIF {
    icon: JSX.Element;
    resource: string;
    text: string;
}
export default function MobileDropdown() {
    const {
        snackbar: { open: openSnackbar },
        // appHeaderDropdown,
    } = useContext(AppStateContext);
    const { userAddress, isUserConnected, disconnectUser, ensName } =
        useContext(UserDataContext);
    const accountAddress =
        isUserConnected && userAddress ? trimString(userAddress, 6, 6) : '';
    const accountAddressFull =
        isUserConnected && userAddress ? userAddress : '';
    const { connectedUserXp } = useContext(ChainDataContext);

    const { resetTokenBalances } = useContext(TokenBalanceContext);
    const { resetUserGraphData } = useContext(GraphDataContext);
    const { setShowAllData } = useContext(TradeTableContext);
    const { resetReceiptData } = useContext(ReceiptContext);

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

    const { setCrocEnv } = useContext(CrocEnvContext);

    const [_, copy] = useCopyToClipboard();

    function handleCopyAddress() {
        copy(accountAddressFull);
        openSnackbar(`${accountAddressFull} copied`, 'info');
    }

    const clickLogout = useCallback(async () => {
        setBaseTokenBalance('');
        setQuoteTokenBalance('');
        setBaseTokenDexBalance('');
        setQuoteTokenDexBalance('');
        resetUserGraphData();
        resetReceiptData();
        resetTokenBalances();
        setShowAllData(true);
        disconnectUser();
        setCrocEnv(undefined);
    }, []);

    const actionsContainer = (
        <div className={styles.actionsContainer}>
            <Link
                className={styles.accountLink}
                to={'/account'}
                aria-label='Go to the account page '
                tabIndex={0}
                // onClick={clickOutsideHandler}
            >
                <CgProfile />
                My Account
            </Link>
            <LogoutButton onClick={clickLogout} />
        </div>
    );

    const userContent = (
        <div className={styles.userContentContainer}>
            <UserLevelDisplay
                currentLevel={connectedUserXp?.data?.currentLevel}
                globalPoints={connectedUserXp?.data?.globalPoints}
                user={ensName ?? accountAddressFull}
                isMobileDropdown
            />

            <WalletDropdown
                ensName={ensName ?? ''}
                accountAddress={accountAddress}
                handleCopyAddress={handleCopyAddress}
                accountAddressFull={accountAddressFull}
                clickLogout={clickLogout}
                clickOutsideHandler={() => console.log('outside')}
                hideProfileCard
            />
        </div>
    );
    // -----------
    const [, , termsUrls] = useTermsAgreed();

    const navData: navDataIF[] = [
        {
            icon: <SiGitbook size={20} />,
            resource: DOCS_LINK,
            text: 'Docs',
        },
        {
            icon: <AiFillTwitterCircle size={20} />,
            resource: TWITTER_LINK,
            text: 'Twitter',
        },
        {
            icon: <FaDiscord size={20} />,
            resource: DISCORD_LINK,
            text: 'Discord',
        },
        {
            icon: <BsMedium size={20} />,
            resource: MEDIUM_LINK,
            text: 'Medium',
        },
        {
            icon: <RiSpyFill size={20} />,
            resource: `${window.location.origin}/${termsUrls.privacy}`,
            text: 'Privacy',
        },
        {
            icon: <IoDocumentTextSharp size={20} />,
            resource: `${window.location.origin}/${termsUrls.tos}`,
            text: 'Terms of Service',
        },
        {
            icon: <FaQuestion size={20} />,
            resource: `${window.location.origin}/faq`,
            text: 'FAQ',
        },
    ];

    const linksContent = (
        <div className={styles.linksContainer}>
            <div className={styles.linksContent}>
                {navData.map((item: navDataIF) => (
                    <NavbarDropdownItem
                        key={item.text}
                        rightIcon={item.icon}
                        onClick={() => {
                            openInNewTab(item.resource);
                            // closeMenu && closeMenu();
                        }}
                    >
                        {item.text}
                    </NavbarDropdownItem>
                ))}
            </div>
            {actionsContainer}
        </div>
    );
    const [activeContent, setActiveContent] = useState('userContent');
    const navigation = (
        <header className={styles.navigationContainer}>
            <div className={styles.navIcons}>
                <div className={styles.navIcon}>
                    <MdAccountCircle
                        size={22}
                        onClick={() => setActiveContent('userContent')}
                        color={
                            activeContent === 'userContent'
                                ? 'var(--accent1)'
                                : ''
                        }
                    />
                </div>
                <div className={styles.navIcon}>
                    <BsCurrencyExchange
                        size={22}
                        onClick={() => setActiveContent('exchangeContent')}
                        color={
                            activeContent === 'exchangeContent'
                                ? 'var(--accent1)'
                                : ''
                        }
                    />
                </div>

                <div className={styles.navIcon}>
                    <IoIosSettings
                        size={22}
                        onClick={() => setActiveContent('linksContent')}
                        color={
                            activeContent === 'linksContent'
                                ? 'var(--accent1)'
                                : ''
                        }
                    />
                </div>
            </div>
            <UserProfileCard
                ensName={ensName ?? ''}
                accountAddress={accountAddress}
                handleCopyAddress={handleCopyAddress}
                accountAddressFull={accountAddressFull}
                isMobileDropdown
            />
        </header>
    );

    const exchangeContent = (
        <ExchangeBalance
            fullLayoutActive={false}
            setFullLayoutActive={() => console.log('yea')}
            setIsAutoLayout={() => console.log('yea')}
        />
    );

    const isDraft = true;

    if (isDraft) return null;

    return (
        <section className={styles.container}>
            {navigation}
            {activeContent === 'userContent' && userContent}
            {activeContent === 'linksContent' && linksContent}
            {activeContent === 'exchangeContent' && exchangeContent}
        </section>
    );
}
