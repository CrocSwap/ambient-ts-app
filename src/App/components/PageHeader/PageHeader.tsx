import { useEffect, useState, memo, useContext, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimateSharedLayout } from 'framer-motion';
import Account from './Account/Account';
import NetworkSelector from './NetworkSelector/NetworkSelector';
import trimString from '../../../utils/functions/trimString';
import logo from '../../../assets/images/logos/logo_mark.svg';
import mainLogo from '../../../assets/images/logos/large.svg';
import NotificationCenter from '../../../components/Global/NotificationCenter/NotificationCenter';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../utils/hooks/reduxToolkit';
import { useAccount, useDisconnect, useEnsName, useSwitchNetwork } from 'wagmi';
import { TokenIF } from '../../../utils/interfaces/exports';
import { BiGitBranch } from 'react-icons/bi';
import { APP_ENVIRONMENT, BRANCH_NAME } from '../../../constants';
import { formSlugForPairParams } from '../../functions/urlSlugs';
import TradeNowButton from '../../../components/Home/Landing/TradeNowButton/TradeNowButton';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { PoolContext } from '../../../contexts/PoolContext';
import { SidebarContext } from '../../../contexts/SidebarContext';
import { TradeTokenContext } from '../../../contexts/TradeTokenContext';
import { resetUserGraphData } from '../../../utils/state/graphDataSlice';
import { resetReceiptData } from '../../../utils/state/receiptDataSlice';
import {
    resetTokenData,
    resetUserAddresses,
} from '../../../utils/state/userDataSlice';
import { TradeTableContext } from '../../../contexts/TradeTableContext';
import { getFormattedNumber } from '../../functions/getFormattedNumber';
import {
    AuthenticateButton,
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

const PageHeader = function () {
    const {
        crocEnv,
        setCrocEnv,
        chainData: { chainId, poolIndex: poolId },
    } = useContext(CrocEnvContext);

    const {
        wagmiModal: { open: openWagmiModal },
    } = useContext(AppStateContext);

    const { poolPriceDisplay } = useContext(PoolContext);
    const { recentPools } = useContext(SidebarContext);
    const { setShowAllData } = useContext(TradeTableContext);
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
    const { address, isConnected } = useAccount();
    const { data: ensName } = useEnsName({ address });

    // eslint-disable-next-line
    const [mobileNavToggle, setMobileNavToggle] = useState<boolean>(false);

    const accountAddress =
        isConnected && address ? trimString(address, 6, 6) : '';
    const userData = useAppSelector((state) => state.userData);

    const connectedUserNativeToken = userData.tokens.nativeToken;

    const dispatch = useAppDispatch();
    const { disconnect } = useDisconnect();

    const clickLogout = useCallback(async () => {
        setCrocEnv(undefined);
        setBaseTokenBalance('');
        setQuoteTokenBalance('');
        setBaseTokenDexBalance('');
        setQuoteTokenDexBalance('');
        dispatch(resetUserGraphData());
        dispatch(resetReceiptData());
        dispatch(resetTokenData());
        dispatch(resetUserAddresses());
        setShowAllData(true);
        disconnect();
    }, []);

    const formatTokenData = (data: TokenIF[] | undefined) => {
        if (!data) return null;

        // Filter data to only contain USDC and DAI tokens
        const filteredData = data.filter((token) => {
            const address = token.address;
            return address === '0xd87ba7a50b2e7e660f678a895e4b72e7cb4ccd9c';
        });

        // We want usdc first and dai second
        const sortedData = filteredData.sort((a, b) => {
            if (a.address === '0xd87ba7a50b2e7e660f678a895e4b72e7cb4ccd9c') {
                return -1;
            } else if (
                b.address === '0xd87ba7a50b2e7e660f678a895e4b72e7cb4ccd9c'
            ) {
                return 1;
            } else if (
                a.address === '0xdc31ee1784292379fbb2964b3b9c4124d8f89c60'
            ) {
                return -1;
            } else if (
                b.address === '0xdc31ee1784292379fbb2964b3b9c4124d8f89c60'
            ) {
                return 1;
            } else {
                return 0;
            }
        });

        const result = sortedData.map((obj) => ({
            logo: obj.logoURI,
            symbol: obj.symbol,
            value: obj.walletBalanceDisplayTruncated,
            amount: obj.combinedBalanceDisplayTruncated,
        }));

        return result;
    };

    const walletDropdownTokenData = formatTokenData(
        userData.tokens.erc20Tokens,
    );

    const accountProps = {
        nativeBalance:
            connectedUserNativeToken?.combinedBalanceDisplayTruncated,
        accountAddress: accountAddress,
        accountAddressFull: isConnected && address ? address : '',
        ensName: ensName || '',
        isUserLoggedIn: isConnected,
        clickLogout: clickLogout,
        walletDropdownTokenData,
    };
    const desktopScreen = useMediaQuery('(min-width: 1020px)');

    const connectWagmiButton = (
        <AuthenticateButton
            desktopScreen={desktopScreen}
            onClick={openWagmiModal}
        >
            {desktopScreen ? 'Connect Wallet' : 'Connect'}
        </AuthenticateButton>
    );
    // ----------------------------NAVIGATION FUNCTIONALITY-------------------------------------

    const location = useLocation();

    const tradeData = useAppSelector((state) => state.tradeData);

    const paramsSlug = formSlugForPairParams(
        tradeData.tokenA.chainId,
        tradeData.tokenA,
        tradeData.tokenB,
    );

    const baseSymbol = tradeData.baseToken.symbol;
    const quoteSymbol = tradeData.quoteToken.symbol;
    const isDenomBase = tradeData.isDenomBase;
    const baseAddressInRtk = tradeData.baseToken.address;
    const quoteAddressInRtk = tradeData.quoteToken.address;

    useEffect(() => {
        if (baseAddressInRtk && quoteAddressInRtk && crocEnv) {
            const promise = crocEnv
                .pool(tradeData.baseToken.address, tradeData.quoteToken.address)
                .isInit();
            Promise.resolve(promise).then((poolExists: boolean) => {
                poolExists &&
                    recentPools.add(
                        tradeData.baseToken,
                        tradeData.quoteToken,
                        chainId,
                        poolId,
                    );
            });
        }
    }, [baseAddressInRtk, quoteAddressInRtk, crocEnv]);

    const poolPriceDisplayWithDenom = poolPriceDisplay
        ? isDenomBase
            ? 1 / poolPriceDisplay
            : poolPriceDisplay
        : undefined;

    const truncatedPoolPrice = getFormattedNumber({
        value: poolPriceDisplayWithDenom,
    });

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

        if (pathNoLeadingSlash === 'account') {
            document.title = 'My Account ~ Ambient';
        } else if (isPathValidAddress) {
            const pathNoPrefix = pathNoLeadingSlash.replace(/account\//, '');
            const pathNoPrefixDecoded = decodeURIComponent(pathNoPrefix);
            const ensNameOrAddressTruncated = isAddressEns
                ? pathNoPrefixDecoded.length > 15
                    ? trimString(pathNoPrefixDecoded, 10, 3, '…')
                    : pathNoPrefixDecoded
                : trimString(pathNoPrefixDecoded, 6, 0, '…');
            document.title = `${ensNameOrAddressTruncated} ~ Ambient`;
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
            document.title = 'Explore ~ Ambient';
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

    const linkData = [
        {
            title: 'Home',
            destination: '/',
            shouldDisplay: false,
        },
        {
            title: 'Swap',
            destination: '/swap/' + paramsSlug,
            shouldDisplay: true,
        },
        {
            title: 'Trade',
            destination: tradeDestination + paramsSlug,
            shouldDisplay: true,
        },
        {
            title: 'Pool',
            destination: '/trade/pool/' + paramsSlug,
            shouldDisplay: true,
        },
        {
            title: 'Explore',
            destination: '/explore',
            shouldDisplay: true,
        },
        {
            title: 'Account',
            destination: '/account',
            shouldDisplay: isConnected,
        },
    ];

    // Most of this functionality can be achieve by using the NavLink instead of Link and accessing the isActive prop on the
    // Navlink. Access to this is needed outside of the link itself for animation purposes, which is why it is being done in this way.

    function isActive(linkDestination: string, locationPathname: string) {
        if (linkDestination.includes('/trade')) {
            if (linkDestination.includes('/pool')) {
                return locationPathname.includes('/trade/pool')
                    ? HeaderClasses.active
                    : HeaderClasses.inactive;
            } else {
                return locationPathname.includes(tradeDestination)
                    ? HeaderClasses.active
                    : HeaderClasses.inactive;
            }
        } else if (linkDestination.includes('/swap')) {
            return locationPathname.includes('/swap')
                ? HeaderClasses.active
                : HeaderClasses.inactive;
        } else {
            return locationPathname === linkDestination
                ? HeaderClasses.active
                : HeaderClasses.inactive;
        }
    }

    function isUnderlined(linkDestination: string, locationPathname: string) {
        return (
            (linkDestination.includes('/trade') &&
                (linkDestination.includes('/trade/pool')
                    ? locationPathname.includes('/trade/pool')
                    : locationPathname.includes(tradeDestination))) ||
            (locationPathname.includes('/swap') &&
                linkDestination.includes('/swap')) ||
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
                            className={isActive(
                                link.destination,
                                location.pathname,
                            )}
                            to={link.destination}
                            key={idx}
                        >
                            {link.title}

                            {isUnderlined(
                                link.destination,
                                location.pathname,
                            ) && <UnderlinedMotionDiv layoutId='underline' />}
                        </NavigationLink>
                    ) : null,
                )}
            </PrimaryNavigation>
        </AnimateSharedLayout>
    );

    const { switchNetwork } = useSwitchNetwork();

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
            fixed={location.pathname === '/'}
        >
            <div>
                <LogoContainer to='/' aria-label='Home'>
                    {desktopScreen ? (
                        <img src={mainLogo} alt='ambient' />
                    ) : (
                        <LogoText src={logo} alt='ambient' />
                    )}
                </LogoContainer>
            </div>

            {routeDisplay}
            <RightSide>
                {show ? (
                    <TradeNowDiv justifyContent='flex-end' alignItems='center'>
                        <TradeNowButton inNav />
                    </TradeNowDiv>
                ) : (
                    <div>
                        <FlexContainer
                            alignItems='center'
                            gap={8}
                            overflow='visible'
                        >
                            <FlexContainer fontSize='body' color={'orange'}>
                                {APP_ENVIRONMENT !== 'local' &&
                                APP_ENVIRONMENT !== 'production' ? (
                                    <FlexContainer alignItems='center' gap={4}>
                                        {BRANCH_NAME}
                                        <BiGitBranch color='yellow' />
                                    </FlexContainer>
                                ) : null}
                            </FlexContainer>
                            <NetworkSelector switchNetwork={switchNetwork} />
                            {!isConnected && connectWagmiButton}
                            <Account {...accountProps} />
                            <NotificationCenter />
                        </FlexContainer>
                    </div>
                )}
            </RightSide>
        </PrimaryHeader>
    );
};

export default memo(PageHeader);
