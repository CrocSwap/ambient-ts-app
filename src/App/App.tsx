/** ***** Import React and Dongles *******/
import { useContext, useEffect, useState } from 'react';
import {
    Routes,
    Route,
    useLocation,
    Navigate,
    useNavigate,
} from 'react-router-dom';
import {
    setPositionsByUser,
    setChangesByUser,
    setLimitOrdersByUser,
    setDataLoadingStatus,
    resetConnectedUserDataLoadingStatus,
} from '../utils/state/graphDataSlice';
import { useAccount } from 'wagmi';
import SnackbarComponent from '../components/Global/SnackbarComponent/SnackbarComponent';

/** ***** Import JSX Files *******/
import PageHeader from './components/PageHeader/PageHeader';
import Sidebar from './components/Sidebar/Sidebar';
import Home from '../pages/Home/Home';
import Portfolio from '../pages/Portfolio/Portfolio';
import Limit from '../pages/Trade/Limit/Limit';
import Range from '../pages/Trade/Range/Range';
import Swap from '../pages/Swap/Swap';
import TermsOfService from '../pages/TermsOfService/TermsOfService';
import TestPage from '../pages/TestPage/TestPage';
import NotFound from '../pages/NotFound/NotFound';
import Trade from '../pages/Trade/Trade';
import InitPool from '../pages/InitPool/InitPool';
import Reposition from '../pages/Trade/Reposition/Reposition';
import SidebarFooter from '../components/Global/SIdebarFooter/SidebarFooter';

/** * **** Import Local Files *******/
import './App.css';
import { useAppDispatch, useAppSelector } from '../utils/hooks/reduxToolkit';
import { getDefaultPairForChain } from '../utils/data/defaultTokens';
import {
    LimitOrderIF,
    TokenIF,
    TransactionIF,
    PositionIF,
} from '../utils/interfaces/exports';
import { fetchTokenLists } from './functions/fetchTokenLists';
import {
    resetTokenData,
    resetUserAddresses,
    setAddressAtLogin,
    setAddressCurrent,
    setIsLoggedIn,
    setRecentTokens,
} from '../utils/state/userDataSlice';
import {
    GRAPHCACHE_URL,
    GRAPHCACHE_WSS_URL,
    IS_LOCAL_ENV,
    SHOULD_CANDLE_SUBSCRIPTIONS_RECONNECT,
    SHOULD_NON_CANDLE_SUBSCRIPTIONS_RECONNECT,
} from '../constants';
import GlobalModal from './components/GlobalModal/GlobalModal';
import ChatPanel from '../components/Chat/ChatPanel';
import { getPositionData } from './functions/getPositionData';
import { getLimitOrderData } from './functions/getLimitOrderData';
import { fetchUserRecentChanges } from './functions/fetchUserRecentChanges';
import AppOverlay from '../components/Global/AppOverlay/AppOverlay';
import WalletModalWagmi from './components/WalletModal/WalletModalWagmi';
import useMediaQuery from '../utils/hooks/useMediaQuery';
import GlobalPopup from './components/GlobalPopup/GlobalPopup';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import useKeyPress from './hooks/useKeyPress';
import { formSlugForPairParams } from './functions/urlSlugs';
import Accessibility from '../pages/Accessibility/Accessibility';
import useWebSocketSubs from './hooks/useWebSocketSubs';
import { AppStateContext } from '../contexts/AppStateContext';
import { CrocEnvContext } from '../contexts/CrocEnvContext';
import { ChainDataContext } from '../contexts/ChainDataContext';
import { TokenContext } from '../contexts/TokenContext';
import { SidebarContext } from '../contexts/SidebarContext';
import { CandleContext } from '../contexts/CandleContext';
import { TradeTokenContext } from '../contexts/TradeTokenContext';
import { TradeTableContext } from '../contexts/TradeTableContext';
import { ChartContext } from '../contexts/ChartContext';

const httpGraphCacheServerDomain = GRAPHCACHE_URL;
const wssGraphCacheServerDomain = GRAPHCACHE_WSS_URL;

/** ***** React Function *******/
export default function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentLocation = location.pathname;

    const {
        server: { isEnabled: isServerEnabled },
        subscriptions: { isEnabled: areSubscriptionsEnabled },
        outsideControl: { setIsActive: setOutsideControlActive },
        outsideTab: { setSelected: setOutsideTabSelected },
        chat: {
            isOpen: isChatOpen,
            setIsOpen: setChatOpen,
            isEnabled: isChatEnabled,
        },
        theme: { selected: selectedTheme },
    } = useContext(AppStateContext);
    const {
        isCandleSelected: { value: isCandleSelected },
        candleData: { value: candleData, setValue: setCandleData },
        candleTimeLocal,
    } = useContext(CandleContext);
    const { crocEnv, chainData, isChainSupported } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { isFullScreen: fullScreenChart } = useContext(ChartContext);
    const { tokens } = useContext(TokenContext);
    const {
        baseToken: {
            address: baseTokenAddress,
            mainnetAddress: mainnetBaseTokenAddress,
        },
        quoteToken: {
            address: quoteTokenAddress,
            mainnetAddress: mainnetQuoteTokenAddress,
        },
    } = useContext(TradeTokenContext);
    const { currentPositionActive, currentTxActiveInTransactions } =
        useContext(TradeTableContext);
    const {
        sidebar: {
            isOpen: isSidebarOpen,
            close: closeSidebar,
            open: openSidebar,
            toggle: toggleSidebar,
        },
    } = useContext(SidebarContext);

    const userData = useAppSelector((state) => state.userData);

    const { address: userAddress, isConnected } = useAccount();

    const dispatch = useAppDispatch();

    // CONTEXT: move to userDataContext
    // TODO: Wagmi isConnected === userData.isLoggedIn - can consolidate and use either as source of truth && Wagmi address === useData.userAddress
    useEffect(() => {
        if (isConnected) {
            if (userData.isLoggedIn === false && userAddress) {
                IS_LOCAL_ENV && console.debug('settting to logged in');
                dispatch(setIsLoggedIn(true));
                dispatch(setAddressCurrent(userAddress));
            } else if (userData.isLoggedIn === false) {
                IS_LOCAL_ENV &&
                    console.debug('settting to logged in - no address');
                dispatch(setIsLoggedIn(true));
            } else if (userData.isLoggedIn === undefined) {
                IS_LOCAL_ENV && console.debug('settting to logged out');
                dispatch(setIsLoggedIn(false));
                dispatch(resetUserAddresses());
            }
        } else {
            if (userData.isLoggedIn === true) {
                IS_LOCAL_ENV && console.debug('settting to logged out');
                dispatch(setIsLoggedIn(false));
                dispatch(resetUserAddresses());
            }
        }
        dispatch(resetTokenData());
    }, [isConnected, userData.isLoggedIn, userAddress]);

    // CONTEXT: user data context
    const userLimitOrderStatesCacheEndpoint =
        httpGraphCacheServerDomain + '/user_limit_order_states?';
    useEffect(() => {
        if (isServerEnabled && isConnected && userAddress && crocEnv) {
            dispatch(resetConnectedUserDataLoadingStatus());

            IS_LOCAL_ENV && console.debug('fetching user positions');

            const userPositionsCacheEndpoint =
                httpGraphCacheServerDomain + '/user_positions?';

            try {
                fetch(
                    userPositionsCacheEndpoint +
                        new URLSearchParams({
                            user: userAddress,
                            chainId: chainData.chainId,
                            ensResolution: 'true',
                            annotate: 'true',
                            omitKnockout: 'true',
                            addValue: 'true',
                        }),
                )
                    .then((response) => response?.json())
                    .then((json) => {
                        const userPositions = json?.data;

                        dispatch(
                            setDataLoadingStatus({
                                datasetName: 'connectedUserRangeData',
                                loadingStatus: false,
                            }),
                        );

                        if (userPositions && crocEnv) {
                            Promise.all(
                                userPositions.map((position: PositionIF) => {
                                    return getPositionData(
                                        position,
                                        tokens.tokenUniv,
                                        crocEnv,
                                        chainData.chainId,
                                        lastBlockNumber,
                                    );
                                }),
                            ).then((updatedPositions) => {
                                dispatch(
                                    setPositionsByUser({
                                        dataReceived: true,
                                        positions: updatedPositions,
                                    }),
                                );
                            });
                        }
                    })
                    .catch(console.error);
            } catch (error) {
                console.error;
            }

            IS_LOCAL_ENV && console.debug('fetching user limit orders ');

            fetch(
                userLimitOrderStatesCacheEndpoint +
                    new URLSearchParams({
                        user: userAddress,
                        chainId: chainData.chainId,
                        ensResolution: 'true',
                        omitEmpty: 'true',
                    }),
            )
                .then((response) => response?.json())
                .then((json) => {
                    const userLimitOrderStates = json?.data;
                    dispatch(
                        setDataLoadingStatus({
                            datasetName: 'connectedUserOrderData',
                            loadingStatus: false,
                        }),
                    );
                    if (userLimitOrderStates) {
                        Promise.all(
                            userLimitOrderStates.map(
                                (limitOrder: LimitOrderIF) => {
                                    return getLimitOrderData(
                                        limitOrder,
                                        tokens.tokenUniv,
                                    );
                                },
                            ),
                        ).then((updatedLimitOrderStates) => {
                            dispatch(
                                setLimitOrdersByUser({
                                    dataReceived: true,
                                    limitOrders: updatedLimitOrderStates,
                                }),
                            );
                        });
                    }
                })
                .catch(console.error);

            try {
                fetchUserRecentChanges({
                    tokenList: tokens.tokenUniv,
                    user: userAddress,
                    chainId: chainData.chainId,
                    annotate: true,
                    addValue: true,
                    simpleCalc: true,
                    annotateMEV: false,
                    ensResolution: true,
                    n: 100, // fetch last 100 changes,
                })
                    .then((updatedTransactions) => {
                        dispatch(
                            setDataLoadingStatus({
                                datasetName: 'connectedUserTxData',
                                loadingStatus: false,
                            }),
                        );
                        if (updatedTransactions) {
                            dispatch(
                                setChangesByUser({
                                    dataReceived: true,
                                    changes: updatedTransactions,
                                }),
                            );
                            const result: TokenIF[] = [];
                            const tokenMap = new Map();
                            for (const item of updatedTransactions as TransactionIF[]) {
                                if (!tokenMap.has(item.base)) {
                                    const isFoundInAmbientList =
                                        tokens.defaultTokens.some(
                                            (ambientToken) => {
                                                if (
                                                    ambientToken.address.toLowerCase() ===
                                                    item.base.toLowerCase()
                                                )
                                                    return true;
                                                return false;
                                            },
                                        );
                                    if (!isFoundInAmbientList) {
                                        tokenMap.set(item.base, true); // set any value to Map
                                        result.push({
                                            name: item.baseName,
                                            address: item.base,
                                            symbol: item.baseSymbol,
                                            decimals: item.baseDecimals,
                                            chainId: parseInt(item.chainId),
                                            logoURI: item.baseTokenLogoURI,
                                        });
                                    }
                                }
                                if (!tokenMap.has(item.quote)) {
                                    const isFoundInAmbientList =
                                        tokens.defaultTokens.some(
                                            (ambientToken) => {
                                                if (
                                                    ambientToken.address.toLowerCase() ===
                                                    item.quote.toLowerCase()
                                                )
                                                    return true;
                                                return false;
                                            },
                                        );
                                    if (!isFoundInAmbientList) {
                                        tokenMap.set(item.quote, true); // set any value to Map
                                        result.push({
                                            name: item.quoteName,
                                            address: item.quote,
                                            symbol: item.quoteSymbol,
                                            decimals: item.quoteDecimals,
                                            chainId: parseInt(item.chainId),
                                            logoURI: item.quoteTokenLogoURI,
                                        });
                                    }
                                }
                            }
                            dispatch(setRecentTokens(result));
                        }
                    })
                    .catch(console.error);
            } catch (error) {
                console.error;
            }
        }
    }, [
        isServerEnabled,
        tokens.tokenUniv,
        isConnected,
        userAddress,
        chainData.chainId,
        crocEnv,
    ]);

    const showSidebarByDefault = useMediaQuery('(min-width: 1776px)');
    function toggleSidebarBasedOnRoute() {
        if (
            currentLocation === '/' ||
            currentLocation === '/swap' ||
            currentLocation.includes('/account')
        ) {
            closeSidebar();
        } else if (showSidebarByDefault) {
            openSidebar();
        } else {
            closeSidebar();
        }
    }

    function toggleTradeTabBasedOnRoute() {
        if (!isCandleSelected) {
            setOutsideControlActive(true);
            if (currentLocation.includes('/market')) {
                setOutsideTabSelected(0);
            } else if (currentLocation.includes('/limit')) {
                setOutsideTabSelected(1);
            } else if (
                currentLocation.includes('/range') ||
                currentLocation.includes('reposition') ||
                currentLocation.includes('add')
            ) {
                setOutsideTabSelected(2);
            }
        }
    }

    // sidebar context
    useEffect(() => {
        toggleSidebarBasedOnRoute();
    }, [location.pathname.includes('/trade')]);

    // trade tab context
    useEffect(() => {
        if (!currentTxActiveInTransactions && !currentPositionActive)
            toggleTradeTabBasedOnRoute();
    }, [location.pathname.includes('/trade')]);

    interface UrlRoutesTemplate {
        swap: string;
        market: string;
        limit: string;
        range: string;
    }

    // CONTEXT: croc env context
    function createDefaultUrlParams(chainId: string): UrlRoutesTemplate {
        const [tokenA, tokenB] = getDefaultPairForChain(chainId);
        const pairSlug = formSlugForPairParams(chainId, tokenA, tokenB);
        return {
            swap: `/swap/${pairSlug}`,
            market: `/trade/market/${pairSlug}`,
            range: `/trade/range/${pairSlug}`,
            limit: `/trade/limit/${pairSlug}`,
        };
    }
    const initUrl = createDefaultUrlParams(chainData.chainId);
    const [defaultUrlParams, setDefaultUrlParams] =
        useState<UrlRoutesTemplate>(initUrl);
    useEffect(() => {
        setDefaultUrlParams(createDefaultUrlParams(chainData.chainId));
    }, [chainData.chainId]);

    useWebSocketSubs({
        crocEnv,
        wssGraphCacheServerDomain,
        baseTokenAddress,
        quoteTokenAddress,
        mainnetBaseTokenAddress,
        mainnetQuoteTokenAddress,
        isServerEnabled,
        shouldNonCandleSubscriptionsReconnect:
            SHOULD_NON_CANDLE_SUBSCRIPTIONS_RECONNECT,
        areSubscriptionsEnabled,
        tokenUniv: tokens.tokenUniv,
        chainData,
        lastBlockNumber,
        candleData,
        setCandleData,
        candleTimeLocal,
        userAddress,
        shouldCandleSubscriptionsReconnect:
            SHOULD_CANDLE_SUBSCRIPTIONS_RECONNECT,
    });

    // Take away margin from left if we are on homepage or swap
    const swapBodyStyle = currentLocation.startsWith('/swap')
        ? 'swap-body'
        : null;

    // Show sidebar on all pages except for home and swap
    const sidebarRender = currentLocation !== '/' &&
        currentLocation !== '/swap' &&
        currentLocation !== '/404' &&
        !currentLocation.includes('/chat') &&
        !fullScreenChart &&
        isChainSupported && <Sidebar />;

    const sidebarDislayStyle = isSidebarOpen
        ? 'sidebar_content_layout'
        : 'sidebar_content_layout_close';

    const showSidebarOrNullStyle =
        currentLocation == '/' ||
        currentLocation == '/swap' ||
        currentLocation == '/404' ||
        currentLocation.includes('/chat') ||
        currentLocation.startsWith('/swap')
            ? 'hide_sidebar'
            : sidebarDislayStyle;

    const containerStyle = currentLocation.includes('trade')
        ? 'content-container-trade'
        : 'content-container';

    // CONTEXT: investigate
    // KEYBOARD SHORTCUTS ROUTES
    const routeShortcuts = {
        S: '/swap',
        T: '/trade',
        M: 'trade/market',
        R: 'trade/range',
        L: 'trade/limit',
        P: '/account',
        C: '/chat',
    };
    Object.entries(routeShortcuts).forEach(([key, route]) => {
        useKeyboardShortcuts({ modifierKeys: ['Shift'], key }, () => {
            navigate(route);
        });
    });
    // KEYBOARD SHORTCUTS STATES
    // keyboard shortcuts for states will require multiple modifier keys.
    useKeyboardShortcuts(
        { modifierKeys: ['Shift', 'Control'], key: ' ' },
        () => {
            toggleSidebar(true);
        },
    );
    useKeyboardShortcuts(
        { modifierKeys: ['Shift', 'Control'], key: 'C' },
        () => {
            setChatOpen(!isChatOpen);
        },
    );
    // Since input field are autofocused on each route, we need a way for the user to exit that focus on their keyboard. This achieves that.
    const isEscapePressed = useKeyPress('Escape');
    useEffect(() => {
        if (isEscapePressed) {
            const focusedInput = document?.querySelector(
                ':focus',
            ) as HTMLInputElement;
            if (focusedInput) {
                focusedInput.blur();
            }
        }
    }, [isEscapePressed]);

    return (
        <>
            <div className={containerStyle} data-theme={selectedTheme}>
                <AppOverlay />
                {currentLocation !== '/404' && <PageHeader />}
                <section
                    className={`${showSidebarOrNullStyle} ${swapBodyStyle}`}
                >
                    {!currentLocation.startsWith('/swap') && sidebarRender}
                    <Routes>
                        <Route index element={<Home />} />
                        <Route
                            path='accessibility'
                            element={<Accessibility />}
                        />
                        <Route path='trade' element={<Trade />}>
                            <Route
                                path=''
                                element={
                                    <Navigate to='/trade/market' replace />
                                }
                            />
                            <Route
                                path='market'
                                element={
                                    <Navigate
                                        to={defaultUrlParams.market}
                                        replace
                                    />
                                }
                            />
                            <Route
                                path='market/:params'
                                element={<Swap isOnTradeRoute={true} />}
                            />
                            <Route
                                path='limit'
                                element={
                                    <Navigate
                                        to={defaultUrlParams.limit}
                                        replace
                                    />
                                }
                            />
                            <Route path='limit/:params' element={<Limit />} />
                            <Route
                                path='range'
                                element={
                                    <Navigate
                                        to={defaultUrlParams.range}
                                        replace
                                    />
                                }
                            />
                            <Route path='range/:params' element={<Range />} />
                            <Route
                                path='reposition'
                                element={
                                    <Navigate
                                        to={defaultUrlParams.range}
                                        replace
                                    />
                                }
                            />
                            <Route
                                path='reposition/:params'
                                element={<Reposition />}
                            />
                            <Route
                                path='edit/'
                                element={
                                    <Navigate to='/trade/market' replace />
                                }
                            />
                        </Route>
                        <Route
                            path='chat'
                            element={
                                <ChatPanel isFullScreen={true} appPage={true} />
                            }
                        />

                        <Route
                            path='chat/:params'
                            element={
                                <ChatPanel isFullScreen={true} appPage={true} />
                            }
                        />
                        <Route path='initpool/:params' element={<InitPool />} />
                        <Route
                            path='account'
                            element={<Portfolio userAccount={true} />}
                        />
                        <Route
                            path='account/:address'
                            element={<Portfolio userAccount={false} />}
                        />

                        <Route
                            path='swap'
                            element={
                                <Navigate replace to={defaultUrlParams.swap} />
                            }
                        />
                        <Route path='swap/:params' element={<Swap />} />
                        <Route path='tos' element={<TermsOfService />} />
                        {IS_LOCAL_ENV && (
                            <Route path='testpage' element={<TestPage />} />
                        )}
                        <Route
                            path='/:address'
                            element={<Portfolio userAccount={false} />}
                        />
                        <Route path='/404' element={<NotFound />} />
                    </Routes>
                </section>
            </div>
            <div className='footer_container'>
                {currentLocation !== '/' &&
                    !currentLocation.includes('/chat') &&
                    isChatEnabled && <ChatPanel isFullScreen={false} />}
            </div>
            <SidebarFooter />
            <GlobalModal />
            <GlobalPopup />
            <SnackbarComponent />
            <WalletModalWagmi />
        </>
    );
}
