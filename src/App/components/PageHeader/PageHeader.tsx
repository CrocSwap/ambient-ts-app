import { AnimateSharedLayout, motion } from 'framer-motion';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { Link, useLocation } from 'react-router-dom';
import {
    DISABLE_ALL_TUTOS,
    LINK_TO_PERPS_HOME,
} from '../../../ambient-utils/constants';
import {
    chainNumToString,
    checkEoaHexAddress,
    getFormattedNumber,
    someSupportedNetworkIsVaultSupportedNetwork,
    trimString,
} from '../../../ambient-utils/dataLayer';
import logo from '../../../assets/images/logos/ambient_logo_mark.svg';
import Button from '../../../components/Form/Button';
import TutorialOverlayUrlBased from '../../../components/Global/TutorialOverlay/TutorialOverlayUrlBased';
import TradeNowButton from '../../../components/Home/Landing/TradeNowButton/TradeNowButton';
import { BrandContext, ChainDataContext } from '../../../contexts';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { useBottomSheet } from '../../../contexts/BottomSheetContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { GraphDataContext } from '../../../contexts/GraphDataContext';
import { PoolContext } from '../../../contexts/PoolContext';
import { ReceiptContext } from '../../../contexts/ReceiptContext';
import { TokenBalanceContext } from '../../../contexts/TokenBalanceContext';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { TradeTableContext } from '../../../contexts/TradeTableContext';
import { TradeTokenContext } from '../../../contexts/TradeTokenContext';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { FlexContainer } from '../../../styled/Common';
import {
    linkGenMethodsIF,
    swapParamsIF,
    useLinkGen,
} from '../../../utils/hooks/useLinkGen';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import NetworkSelector from './NetworkSelector/NetworkSelector';
import styles from './PageHeader.module.css';
import UserMenu from './UserMenu/UserMenu';

const PageHeader = function () {
    const {
        walletModal: { open: openWalletModal },
        appHeaderDropdown,
    } = useContext(AppStateContext);
    const { headerImage, platformName } = useContext(BrandContext);
    const { setCrocEnv } = useContext(CrocEnvContext);
    const { resetTokenBalances } = useContext(TokenBalanceContext);
    const { resetUserGraphData } = useContext(GraphDataContext);
    const { isActiveNetworkMonad } = useContext(ChainDataContext);
    const { poolPriceDisplay, isTradeDollarizationEnabled, usdPrice } =
        useContext(PoolContext);
    const { setShowAllData, activeTradeTab } = useContext(TradeTableContext);
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
    const { userAddress, isUserConnected, disconnectUser, ensName } =
        useContext(UserDataContext);
    const { resetReceiptData } = useContext(ReceiptContext);
    const { isBottomSheetOpen } = useBottomSheet();

    // eslint-disable-next-line
    const [mobileNavToggle, setMobileNavToggle] = useState<boolean>(false);

    const accountAddress =
        isUserConnected && userAddress ? trimString(userAddress, 6, 6) : '';

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

    const userMenuProps = {
        accountAddress: accountAddress,
        accountAddressFull: isUserConnected && userAddress ? userAddress : '',
        ensName: ensName || '',
        isUserLoggedIn: isUserConnected,
        clickLogout: clickLogout,
    };
    const desktopScreen = useMediaQuery('(min-width: 1250px)');

    const connectWalletButton = (
        <Button
            idForDOM='connect_wallet_button_page_header'
            title={desktopScreen ? 'Connect Wallet' : 'Connect'}
            action={openWalletModal}
            thin
            flat
        ></Button>
    );
    // ----------------------------NAVIGATION FUNCTIONALITY-------------------------------------

    const location = useLocation();

    const { tokenA, tokenB, baseToken, quoteToken, isDenomBase } =
        useContext(TradeDataContext);
    const baseSymbol = baseToken.symbol;
    const quoteSymbol = quoteToken.symbol;

    const poolPriceDisplayWithDenom = poolPriceDisplay
        ? isDenomBase
            ? 1 / poolPriceDisplay
            : poolPriceDisplay
        : undefined;

    const truncatedPoolPrice =
        usdPrice && isTradeDollarizationEnabled
            ? getFormattedNumber({ value: usdPrice, prefix: '$' })
            : getFormattedNumber({
                  value: poolPriceDisplayWithDenom,
              });

    function removeAfterEth(inputString: string) {
        // Find the position of ".eth"
        const ethIndex = inputString.indexOf('.eth');

        // If ".eth" is found in the string, return the substring up to and including ".eth"
        if (ethIndex !== -1) {
            return inputString.substring(0, ethIndex + 4);
        }

        // If ".eth" is not found, return the original string
        return inputString;
    }

    useEffect(() => {
        const path = location.pathname;
        const pathNoLeadingSlash = path.slice(1);
        const isAddressEns = pathNoLeadingSlash?.includes('.eth');
        const isAddressHex = checkEoaHexAddress(path);
        const isPathValidAddress = path && (isAddressEns || isAddressHex);

        if (pathNoLeadingSlash.startsWith('account') && !isPathValidAddress) {
            if (pathNoLeadingSlash.includes('points')) {
                document.title = 'My Points ~ Ambient';
            } else if (pathNoLeadingSlash.includes('liquidity')) {
                document.title = 'My Liquidity ~ Ambient';
            } else if (pathNoLeadingSlash.includes('limits')) {
                document.title = 'My Limits ~ Ambient';
            } else if (pathNoLeadingSlash.includes('transactions')) {
                document.title = 'My Transactions ~ Ambient';
            } else if (pathNoLeadingSlash.includes('wallet-balances')) {
                document.title = 'My Wallet Balances ~ Ambient';
            } else if (pathNoLeadingSlash.includes('exchange-balances')) {
                document.title = 'My Exchange Balances ~ Ambient';
            } else {
                document.title = 'My Account ~ Ambient';
            }
        } else if (isPathValidAddress) {
            const pathNoPrefix = pathNoLeadingSlash.replace(/account\//, '');
            const pathNoPrefixDecoded = decodeURIComponent(pathNoPrefix);
            const ensNameOrAddressTruncated = isAddressEns
                ? removeAfterEth(pathNoPrefixDecoded).length > 15
                    ? trimString(
                          removeAfterEth(pathNoPrefixDecoded),
                          10,
                          3,
                          '…',
                      )
                    : removeAfterEth(pathNoPrefixDecoded)
                : trimString(pathNoPrefixDecoded, 6, 0, '…');
            if (pathNoLeadingSlash.includes('points')) {
                document.title = `${ensNameOrAddressTruncated} Points ~ Ambient`;
            } else if (pathNoLeadingSlash.includes('liquidity')) {
                document.title = `${ensNameOrAddressTruncated} Liquidity ~ Ambient`;
            } else if (pathNoLeadingSlash.includes('limits')) {
                document.title = `${ensNameOrAddressTruncated} Limits ~ Ambient`;
            } else if (pathNoLeadingSlash.includes('transactions')) {
                document.title = `${ensNameOrAddressTruncated} Transactions ~ Ambient`;
            } else if (pathNoLeadingSlash.includes('wallet-balances')) {
                document.title = `${ensNameOrAddressTruncated} Wallet Balances ~ Ambient`;
            } else if (pathNoLeadingSlash.includes('exchange-balances')) {
                document.title = `${ensNameOrAddressTruncated} Exchange Balances ~ Ambient`;
            } else if (pathNoLeadingSlash.includes('xp')) {
                document.title = `${ensNameOrAddressTruncated} XP ~ Ambient`;
            } else {
                document.title = `${ensNameOrAddressTruncated} ~ Ambient`;
            }
        } else if (
            location.pathname.includes('swap') ||
            location.pathname.includes('trade')
        ) {
            document.title = isDenomBase
                ? `${baseSymbol}/${quoteSymbol} ${truncatedPoolPrice} ~ Ambient`
                : `${quoteSymbol}/${baseSymbol} ${truncatedPoolPrice} ~ Ambient`;
        } else if (location.pathname.includes('chat')) {
            document.title = 'Chat ~ Ambient';
        } else if (location.pathname.includes('initpool')) {
            document.title = 'Pool Initialization ~ Ambient';
        } else if (location.pathname.includes('explore')) {
            if (location.pathname.includes('pool')) {
                document.title = 'Explore Pools ~ Ambient';
            } else if (location.pathname.includes('tokens')) {
                document.title = 'Explore Tokens ~ Ambient';
            } else {
                document.title = 'Explore ~ Ambient';
            }
        } else if (pathNoLeadingSlash.includes('xp-leaderboard')) {
            document.title = 'XP Leaderboard ~ Ambient';
        } else if (pathNoLeadingSlash.includes('vaults')) {
            document.title = 'Vaults ~ Ambient';
        } else if (location.pathname.includes('404')) {
            document.title = '404 ~ Ambient';
        } else {
            document.title =
                'Ambient | Zero-to-One Decentralized Trading Protocol';
        }
    }, [baseSymbol, quoteSymbol, isDenomBase, location, truncatedPoolPrice]);

    const tradeDestination = location.pathname.includes('trade/market')
        ? '/trade/market/'
        : location.pathname.includes('trade/limit')
          ? '/trade/limit/'
          : location.pathname.includes('trade/edit')
            ? '/trade/edit/'
            : '/trade/market/';

    // hooks to generate URL paths
    const linkGenSwap: linkGenMethodsIF = useLinkGen('swap');
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');

    const swapParams: swapParamsIF = {
        chain: chainNumToString(tokenA.chainId),
        tokenA: tokenA.address,
        tokenB: tokenB.address,
    };

    interface linkDataIF {
        title: string;
        destination: string;
        shouldDisplay: boolean;
    }

    // maintain limits and liquidity tab selection when navigating from portfolio
    const tradeLinkDestination = (
        activeTradeTab === 'limits' ? linkGenLimit : linkGenMarket
    ).getFullURL(swapParams);

    const activeTradeTabSlug =
        activeTradeTab.toLowerCase() === 'exchange balances' ||
        activeTradeTab.toLowerCase() === 'dex balances'
            ? 'exchange-balances'
            : activeTradeTab.toLowerCase() === 'wallet balances'
              ? 'wallet-balances'
              : activeTradeTab.toLowerCase();

    const linkData: linkDataIF[] = [
        {
            title: 'Home',
            destination: '/',
            shouldDisplay: false,
        },
        {
            title: 'Swap',
            destination: linkGenSwap.getFullURL(swapParams),
            shouldDisplay: true,
        },
        {
            title: 'Trade',
            destination: tradeLinkDestination,
            shouldDisplay: true,
        },
        {
            title: 'Pool',
            destination: linkGenPool.getFullURL(swapParams),
            shouldDisplay: true,
        },
        {
            title: 'Explore',
            destination: '/explore',
            shouldDisplay: true,
        },
        {
            title: 'Vaults',
            destination: '/vaults',
            shouldDisplay: someSupportedNetworkIsVaultSupportedNetwork,
        },
        {
            title: 'Account',
            destination: `/account${activeTradeTab && '/' + activeTradeTabSlug}`,
            shouldDisplay: !!isUserConnected,
        },
        {
            title: 'Points',
            destination: '/account/points',
            shouldDisplay:
                !!isUserConnected && desktopScreen && !isActiveNetworkMonad,
        },
    ];

    // Most of this functionality can be achieved by using the NavLink instead of Link and accessing the isActive prop on the
    // Navlink. Access to this is needed outside of the link itself for animation purposes, which is why it is being done in this way.

    function isActive(
        title: string,
        linkDestination: string,
        locationPathname: string,
    ) {
        const trailingSlashRegex = /\/$/;
        const locationPathnameNoTrailingSlash = locationPathname.replace(
            trailingSlashRegex,
            '',
        );
        return (
            (linkDestination.includes('/trade') &&
                (linkDestination.includes('/trade/pool')
                    ? locationPathname.includes('/trade/pool')
                    : locationPathname.includes(tradeDestination))) ||
            (locationPathname.includes('/swap') &&
                linkDestination.includes('/swap')) ||
            (locationPathname.includes('/explore') &&
                linkDestination.includes('/explore')) ||
            (locationPathnameNoTrailingSlash.endsWith('/account') &&
                linkDestination.includes('/account') &&
                !linkDestination.includes('/points')) ||
            (locationPathname === linkDestination &&
                !(title === 'Account' && locationPathname.includes('/points')))
        );
    }

    const routeDisplay = (
        <AnimateSharedLayout>
            <nav className={styles.primaryNavigation} id='primary_navigation'>
                {linkData.map((link, idx) =>
                    link.shouldDisplay ? (
                        <Link
                            className={`${styles.navigationLink}
                        ${
                            isActive(
                                link.title,
                                link.destination,
                                location.pathname,
                            )
                                ? styles.activeNavigationLink
                                : ''
                        }

                        `}
                            tabIndex={0}
                            to={link.destination}
                            key={idx}
                        >
                            {link.title}

                            {isActive(
                                link.title,
                                link.destination,
                                location.pathname,
                            ) && (
                                <motion.span
                                    className={styles.underlineMotion}
                                    layoutId='underline'
                                />
                            )}
                        </Link>
                    ) : null,
                )}
            </nav>
        </AnimateSharedLayout>
    );
    // ----------------------------END OF NAVIGATION FUNCTIONALITY-------------------------------------
    const [show, handleShow] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 1300 && location.pathname === '/') {
                handleShow(true);
            } else {
                handleShow(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // ------------------  TUTORIAL FUNCTIONALITY
    const [replayTutorial, setReplayTutorial] = useState(false);
    const tutorialBtnRef = useRef<HTMLDivElement>(null);

    return (
        <>
            <header
                className={styles.primaryHeader}
                data-testid={'page-header'}
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: isBottomSheetOpen ? 0.1 : 10,
                }}
            >
                <div
                    onClick={(event: React.MouseEvent) => {
                        event?.stopPropagation();
                        if (appHeaderDropdown.isActive) {
                            appHeaderDropdown.setIsActive(false);
                        }
                    }}
                    className={styles.left_side}
                >
                    {platformName === 'ambient' && LINK_TO_PERPS_HOME ? (
                        <a
                            href='/'
                            className={styles.logoContainer}
                            aria-label='Home'
                        >
                            {desktopScreen ? (
                                <img
                                    src={headerImage}
                                    alt='ambient'
                                    style={{ marginRight: '20px' }}
                                />
                            ) : (
                                <img
                                    className={styles.logoText}
                                    src={logo}
                                    alt='ambient'
                                    width='60px'
                                />
                            )}
                        </a>
                    ) : (
                        <Link
                            to='/'
                            className={styles.logoContainer}
                            aria-label='Home'
                        >
                            {desktopScreen ? (
                                <img
                                    src={headerImage}
                                    alt='ambient'
                                    style={{ marginRight: '20px' }}
                                />
                            ) : (
                                <img
                                    className={styles.logoText}
                                    src={logo}
                                    alt='ambient'
                                    width='60px'
                                />
                            )}
                        </Link>
                    )}
                    {routeDisplay}
                </div>
                <div className={styles.rightSide}>
                    {show ? (
                        <div className={styles.tradeNowDiv}>
                            <TradeNowButton
                                inNav
                                fieldId='trade_now_btn_in_page_header'
                            />
                        </div>
                    ) : (
                        <div>
                            <FlexContainer
                                alignItems='center'
                                gap={8}
                                overflow='visible'
                            >
                                <NetworkSelector />
                                {!DISABLE_ALL_TUTOS && (
                                    <div
                                        className={styles.tutorialBtn}
                                        ref={tutorialBtnRef}
                                        onClick={() => setReplayTutorial(true)}
                                    >
                                        {' '}
                                        <AiOutlineQuestionCircle /> Help
                                    </div>
                                )}
                                {!isUserConnected && connectWalletButton}
                                <UserMenu {...userMenuProps} />
                            </FlexContainer>
                        </div>
                    )}
                </div>
            </header>
            {!DISABLE_ALL_TUTOS && (
                <TutorialOverlayUrlBased
                    replayTutorial={replayTutorial}
                    setReplayTutorial={setReplayTutorial}
                    tutorialBtnRef={tutorialBtnRef}
                />
            )}
        </>
    );
};

export default memo(PageHeader);
