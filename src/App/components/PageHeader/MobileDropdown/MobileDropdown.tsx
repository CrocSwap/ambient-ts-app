import { useContext, useEffect, useState } from 'react';
import { openInNewTab, trimString } from '../../../../ambient-utils/dataLayer';
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
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import UserProfileCard from '../UserMenu/UserProfileCard';
import WalletDropdown from '../UserMenu/WalletDropdown/WalletDropdown';
import styles from './MobileDropdown.module.css';
// import LevelDropdown from '../Account/LevelDropdown/LevelDropdown';
import { CgProfile } from 'react-icons/cg';
import { Link } from 'react-router-dom';
import UserLevelDisplay from '../../../../components/Global/LevelsCard/UserLevelDisplay';
import { LogoutButton } from '../../../../components/Global/LogoutButton/LogoutButton';

import { BsCurrencyExchange, BsMedium, BsTwitterX } from 'react-icons/bs';
import { FaDiscord, FaQuestion } from 'react-icons/fa';
import { IoIosSettings } from 'react-icons/io';
import { IoDocumentTextSharp } from 'react-icons/io5';
import { MdAccountCircle } from 'react-icons/md';
import { RiSpyFill } from 'react-icons/ri';
import { SiGitbook } from 'react-icons/si';
import {
    DISCORD_LINK,
    DOCS_LINK,
    MEDIUM_LINK,
    X_LINK,
} from '../../../../ambient-utils/constants';
import ExchangeBalance from '../../../../components/Portfolio/ExchangeBalance/ExchangeBalance';
import { useTermsAgreed } from '../../../hooks/useTermsAgreed';
import NavbarDropdownItem from '../NavbarDropdownMenu/NavbarDropdownItem';
interface navDataIF {
    icon: React.ReactNode;
    resource: string;
    text: string;
}
export default function MobileDropdown() {
    const {
        snackbar: { open: openSnackbar },
        activeNetwork: { chainId },
        // appHeaderDropdown,
    } = useContext(AppStateContext);
    const { userAddress, isUserConnected, disconnectUser, ensName } =
        useContext(UserDataContext);
    const accountAddress =
        isUserConnected && userAddress ? trimString(userAddress, 6, 6) : '';
    const accountAddressFull =
        isUserConnected && userAddress ? userAddress : '';
    const { connectedUserXp, setIsTokenBalanceFetchManuallyTriggerered } =
        useContext(ChainDataContext);

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

    useEffect(() => {
        setIsTokenBalanceFetchManuallyTriggerered(true);
    }, [chainId, accountAddress]);

    const [_, copy] = useCopyToClipboard();

    function handleCopyAddress() {
        copy(accountAddressFull);
        openSnackbar(`${accountAddressFull} copied`, 'info');
    }

    const clickLogout = async () => {
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
    };

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
            icon: <BsTwitterX size={20} />,
            resource: X_LINK,
            text: '𝕏 (Twitter)',
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
