import React, {
    useEffect,
    useState,
    memo,
    useContext,
    useCallback,
} from 'react';
import { useLocation } from 'react-router-dom';
import { AnimateSharedLayout } from 'framer-motion';
import Account from './Account/Account';
import NetworkSelector from './NetworkSelector/NetworkSelector';
import logo from '../../../assets/images/logos/logo_mark.svg';
// import { BiGitBranch } from 'react-icons/bi';
// import { APP_ENVIRONMENT, BRANCH_NAME } from '../../../ambient-utils/constants';
import TradeNowButton from '../../../components/Home/Landing/TradeNowButton/TradeNowButton';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { PoolContext } from '../../../contexts/PoolContext';
import { SidebarContext } from '../../../contexts/SidebarContext';
import { TradeTokenContext } from '../../../contexts/TradeTokenContext';

import { TradeTableContext } from '../../../contexts/TradeTableContext';
import {
    getFormattedNumber,
    chainNumToString,
    trimString,
    checkEoaHexAddress,
} from '../../../ambient-utils/dataLayer';
import {
    linkGenMethodsIF,
    swapParamsIF,
    useLinkGen,
} from '../../../utils/hooks/useLinkGen';
import {
    HeaderClasses,
    LogoContainer,
    LogoText,
    NavigationLink,
    PrimaryHeader,
    PrimaryNavigation,
    RightSide,
    TradeNowDiv,
    UnderlinedMotionDiv,
} from '../../../styled/Components/Header';
import { FlexContainer } from '../../../styled/Common';
import Button from '../../../components/Form/Button';
// import { version as appVersion } from '../../../../package.json';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { GraphDataContext } from '../../../contexts/GraphDataContext';
import { TokenBalanceContext } from '../../../contexts/TokenBalanceContext';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { ReceiptContext } from '../../../contexts/ReceiptContext';
import { BrandContext } from '../../../contexts/BrandContext';

const PageHeader = function () {
    const {
        crocEnv,
        setCrocEnv,
        chainData: { chainId, poolIndex: poolId },
    } = useContext(CrocEnvContext);
    const { headerImage } = useContext(BrandContext);

    const {
        walletModal: { open: openWalletModal },
        appHeaderDropdown,
    } = useContext(AppStateContext);
    const { resetTokenBalances } = useContext(TokenBalanceContext);
    const { resetUserGraphData } = useContext(GraphDataContext);

    const { poolPriceDisplay, isTradeDollarizationEnabled, usdPrice } =
        useContext(PoolContext);
    const { recentPools } = useContext(SidebarContext);
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

    // eslint-disable-next-line
    const [mobileNavToggle, setMobileNavToggle] = useState<boolean>(false);

    const accountAddress =
        isUserConnected && userAddress ? trimString(userAddress, 6, 6) : '';

    const clickLogout = useCallback(async () => {
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
    }, []);

    const accountProps = {
        accountAddress: accountAddress,
        accountAddressFull: isUserConnected && userAddress ? userAddress : '',
        ensName: ensName || '',
        isUserLoggedIn: isUserConnected,
        clickLogout: clickLogout,
    };
    const desktopScreen = useMediaQuery('(min-width: 1020px)');

    const connectWagmiButton = (
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
    const baseAddressInRtk = baseToken.address;
    const quoteAddressInRtk = quoteToken.address;

    useEffect(() => {
        if (baseAddressInRtk && quoteAddressInRtk && crocEnv) {
            const promise = crocEnv
                .pool(baseToken.address, quoteToken.address)
                .isInit();
            Promise.resolve(promise).then((poolExists: boolean) => {
                poolExists &&
                    recentPools.add(baseToken, quoteToken, chainId, poolId);
            });
        }
    }, [baseAddressInRtk, quoteAddressInRtk, crocEnv]);

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
        activeTradeTab.toLowerCase() === 'exchange balances'
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
            title: 'Account',
            destination: `/account${activeTradeTab && '/' + activeTradeTabSlug}`,
            shouldDisplay: !!isUserConnected,
        },
        {
            title: 'Points',
            destination: '/account/points',
            shouldDisplay: !!isUserConnected && desktopScreen,
        },
    ];

    // Most of this functionality can be achieved by using the NavLink instead of Link and accessing the isActive prop on the
    // Navlink. Access to this is needed outside of the link itself for animation purposes, which is why it is being done in this way.

    function isActive(linkDestination: string, locationPathname: string) {
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
            locationPathname === linkDestination
        );
    }

    const routeDisplay = (
        <AnimateSharedLayout>
            <PrimaryNavigation
                id='primary_navigation'
                dataVisible={mobileNavToggle}
            >
                {linkData.map((link, idx) =>
                    link.shouldDisplay ? (
                        <NavigationLink
                            tabIndex={0}
                            className={
                                isActive(link.destination, location.pathname)
                                    ? HeaderClasses.active
                                    : HeaderClasses.inactive
                            }
                            to={link.destination}
                            key={idx}
                        >
                            {link.title}

                            {isActive(link.destination, location.pathname) && (
                                <UnderlinedMotionDiv layoutId='underline' />
                            )}
                        </NavigationLink>
                    ) : null,
                )}
            </PrimaryNavigation>
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

    return (
        <PrimaryHeader
            data-testid={'page-header'}
            fixed={false}
            style={{ position: 'sticky', top: 0, zIndex: 10 }}
        >
            <div
                onClick={(event: React.MouseEvent) => {
                    event?.stopPropagation();
                    if (appHeaderDropdown.isActive) {
                        appHeaderDropdown.setIsActive(false);
                    }
                }}
            >
                <LogoContainer to='/' aria-label='Home'>
                    {desktopScreen ? (
                        <img src={headerImage} alt='ambient' />
                    ) : (
                        <LogoText src={logo} alt='ambient' />
                    )}
                </LogoContainer>
            </div>
            {routeDisplay}
            <RightSide>
                {show ? (
                    <TradeNowDiv justifyContent='flex-end' alignItems='center'>
                        <TradeNowButton
                            inNav
                            fieldId='trade_now_btn_in_page_header'
                        />
                    </TradeNowDiv>
                ) : (
                    <div>
                        <FlexContainer
                            alignItems='center'
                            gap={8}
                            overflow='visible'
                        >
                            {/* {desktopScreen && (
                                <FlexContainer fontSize='body' color={'orange'}>
                                    {APP_ENVIRONMENT !== 'production' ? (
                                        <FlexContainer
                                            alignItems='center'
                                            gap={4}
                                        >
                                            {`${BRANCH_NAME} - v${appVersion}`}
                                            {APP_ENVIRONMENT !== 'testnet' && (
                                                <BiGitBranch color='yellow' />
                                            )}
                                        </FlexContainer>
                                    ) : null}
                                </FlexContainer>
                            )} */}
                            <NetworkSelector />
                            {!isUserConnected && connectWagmiButton}
                            <Account {...accountProps} />
                        </FlexContainer>
                    </div>
                )}
            </RightSide>
        </PrimaryHeader>
    );
};

export default memo(PageHeader);
