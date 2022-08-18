/** ***** Import React and Dongles *******/
import { useEffect, useState, useMemo } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

import {
    resetGraphData,
    setPositionsByPool,
    setPositionsByUser,
    setSwapsByUser,
    ISwap,
    setSwapsByPool,
    CandleData,
    setCandles,
    addCandles,
} from '../utils/state/graphDataSlice';
import { ethers } from 'ethers';
// import { request, gql } from 'graphql-request';
import { useMoralis } from 'react-moralis';

import useWebSocket from 'react-use-websocket';
// import { ReadyState } from 'react-use-websocket';
// import Moralis from 'moralis';
import {
    sortBaseQuoteTokens,
    toDisplayPrice,
    tickToPrice,
    CrocEnv,
    toDisplayQty,
} from '@crocswap-libs/sdk';
import { resetReceiptData } from '../utils/state/receiptDataSlice';

import SnackbarComponent from '../components/Global/SnackbarComponent/SnackbarComponent';

/** ***** Import JSX Files *******/
import PageHeader from './components/PageHeader/PageHeader';
import Sidebar from './components/Sidebar/Sidebar';
import PageFooter from './components/PageFooter/PageFooter';
import Home from '../pages/Home/Home';
import Analytics from '../pages/Analytics/Analytics';
import Portfolio from '../pages/Portfolio/Portfolio';
import Limit from '../pages/Trade/Limit/Limit';
import Range from '../pages/Trade/Range/Range';
import Swap from '../pages/Swap/Swap';
import Edit from '../pages/Trade/Edit/Edit';
import TestPage from '../pages/TestPage/TestPage';
import NotFound from '../pages/NotFound/NotFound';
import Trade from '../pages/Trade/Trade';

/** * **** Import Local Files *******/
import './App.css';
import { useAppDispatch, useAppSelector } from '../utils/hooks/reduxToolkit';
import { defaultTokens } from '../utils/data/defaultTokens';
import initializeUserLocalStorage from './functions/initializeUserLocalStorage';
import TokenPage from '../pages/TokenPage/TokenPage';
import { TokenIF, TokenListIF, PositionIF } from '../utils/interfaces/exports';
import { fetchTokenLists } from './functions/fetchTokenLists';
import {
    resetTokens,
    resetTradeData,
    setAdvancedHighTick,
    setAdvancedLowTick,
    setDenomInBase,
} from '../utils/state/tradeDataSlice';
import PoolPage from '../pages/PoolPage/PoolPage';
// import PositionDetails from '../pages/Trade/Range/PositionDetails';
import { memoizeQuerySpotPrice, querySpotPrice } from './functions/querySpotPrice';
import { memoizeFetchAddress } from './functions/fetchAddress';
import { memoizeTokenBalance } from './functions/fetchTokenBalances';
// import truncateDecimals from '../utils/data/truncateDecimals';
import { getNFTs } from './functions/getNFTs';
import { memoizeTokenDecimals } from './functions/queryTokenDecimals';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { useSlippage } from './useSlippage';
import { useAppChain } from './hooks/useAppChain';
import { addNativeBalance, resetTokenData, setTokens } from '../utils/state/tokenDataSlice';
import { checkIsStable } from '../utils/data/stablePairs';
import { useTokenMap } from '../utils/hooks/useTokenMap';
import Reposition from '../pages/Trade/Reposition/Reposition';
import SidebarFooter from '../components/Global/SIdebarFooter/SidebarFooter';
import { validateChain } from './validateChain';
// import SidebarFooter from '../components/Global/SIdebarFooter/SidebarFooter';

const cachedQuerySpotPrice = memoizeQuerySpotPrice();
const cachedFetchAddress = memoizeFetchAddress();
const cachedFetchTokenBalances = memoizeTokenBalance();
const cachedGetTokenDecimals = memoizeTokenDecimals();

const httpGraphCacheServerDomain = 'https://809821320828123.de:5000';
// const httpGraphCacheServerDomain = '';
const wssGraphCacheServerDomain = 'wss://809821320828123.de:5000';
// const wssGraphCacheServerDomain = '';

const shouldSubscriptionsReconnect = false;

/** ***** React Function *******/
export default function App() {
    const { Moralis, isWeb3Enabled, account, logout, isAuthenticated, isInitialized } =
        useMoralis();

    const tokenMap = useTokenMap();

    const location = useLocation();

    // custom hook to manage chain the app is using
    // `chainData` is data on the current chain retrieved from our SDK
    // `isChainSupported` is a boolean indicating whether the chain is supported by Ambient
    // `switchChain` is a function to switch to a different chain
    // `'0x5'` is the chain the app should be on by default
    const [chainData, isChainSupported, switchChain, switchNetworkInMoralis] = useAppChain('0x5');

    const [isShowAllEnabled, setIsShowAllEnabled] = useState<boolean>(true);

    // const outsideTabControl = {
    //     switchToTab: props.switchTabToTransactions,
    //     tabToSwitchTo: 2,
    //     stateHandler: props.setSwitchTabToTransactions,
    // };

    const [switchTabToOrders, setSwitchTabToOrders] = useState<boolean>(false);

    const [switchTabToTransactions, setSwitchTabToTransactions] = useState<boolean>(false);
    const [currentTxActiveInTransactions, setCurrentTxActiveInTransactions] = useState<string>('');

    const [expandTradeTable, setExpandTradeTable] = useState(false);

    const [provider, setProvider] = useState<ethers.providers.Provider>();

    const [userIsOnline, setUserIsOnline] = useState(navigator.onLine);

    window.ononline = () => {
        setUserIsOnline(true);
        // console.log('Back Online');
    };

    window.onoffline = () => {
        setUserIsOnline(false);
        // console.log('Connection Lost');
    };

    function exposeProviderUrl(provider?: ethers.providers.Provider): string {
        if (provider && 'connection' in provider) {
            return (provider as ethers.providers.JsonRpcProvider).connection?.url;
        } else {
            return '';
        }
    }

    function exposeProviderChain(provider?: ethers.providers.Provider): number {
        if (provider && 'network' in provider) {
            return (provider as ethers.providers.JsonRpcProvider).network?.chainId;
        } else {
            return -1;
        }
    }

    const [metamaskLocked, setMetamaskLocked] = useState<boolean>(true);
    useEffect(() => {
        try {
            const url = exposeProviderUrl(provider);
            // console.log(chainData.chainId)
            const onChain = exposeProviderChain(provider) === parseInt(chainData.chainId);

            if (isAuthenticated) {
                if (provider && url === 'metamask' && !metamaskLocked && onChain) {
                    return;
                } else if (provider && url === 'metamask' && metamaskLocked) {
                    clickLogout();
                } else if (
                    window.ethereum &&
                    !metamaskLocked &&
                    validateChain(window.ethereum.chainId)
                ) {
                    // console.log(window.ethereum.chainId)
                    const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
                    console.log('Metamask Provider');
                    setProvider(metamaskProvider);
                }
            } else if (!provider || !onChain) {
                const url = lookupChain(chainData.chainId).nodeUrl;
                setProvider(new ethers.providers.JsonRpcProvider(url));
            }
        } catch (error) {
            console.log(error);
        }
    }, [isAuthenticated, chainData.chainId, metamaskLocked]);

    useEffect(() => {
        dispatch(resetTokens(chainData.chainId));
        dispatch(resetTokenData());
    }, [chainData.chainId]);

    const dispatch = useAppDispatch();

    // current configurations of trade as specified by the user
    const tradeData = useAppSelector((state) => state.tradeData);

    // tokens specifically imported by the end user
    const [importedTokens, setImportedTokens] = useState<TokenIF[]>(defaultTokens);
    // all tokens from active token lists
    const [searchableTokens, setSearchableTokens] = useState<TokenIF[]>(defaultTokens);

    // prevent multiple fetch requests to external URIs for token lists
    const [needTokenLists, setNeedTokenLists] = useState(true);

    // trigger a useEffect() which needs to run when new token lists are received
    // true vs false is an arbitrary distinction here
    const [tokenListsReceived, indicateTokenListsReceived] = useState(false);

    // this is another case where true vs false is an arbitrary distinction
    const [activeTokenListsChanged, indicateActiveTokenListsChanged] = useState(false);

    // useEffect(() => {
    //     console.log('changed activeTokensList');
    // }, [activeTokenListsChanged]);

    if (needTokenLists) {
        setNeedTokenLists(false);
        fetchTokenLists(tokenListsReceived, indicateTokenListsReceived);
    }

    useEffect(() => {
        initializeUserLocalStorage();
        getImportedTokens();
    }, [tokenListsReceived]);

    useEffect(() => {
        if (isInitialized) {
            (async () => {
                const currentDateTime = new Date().toISOString();
                const defaultChain = 'goerli';
                const options = {
                    chain: defaultChain as 'goerli', // Cheat and narrow type. We know chain string matches Moralis' chain union type
                    date: currentDateTime,
                };
                const currentBlock = (await Moralis.Web3API.native.getDateToBlock(options)).block;
                setLastBlockNumber(currentBlock);
            })();
        }
    }, [isInitialized]);

    // hook holding values and setter functions for slippage
    // holds stable and volatile values for swap and mint transactions
    const [swapSlippage, mintSlippage] = useSlippage();

    //
    const isPairStable = useMemo(
        () => checkIsStable(tradeData.tokenA.address, tradeData.tokenA.address, chainData.chainId),
        [tradeData.tokenA.address, tradeData.tokenA.address, chainData.chainId],
    );

    // useEffect(() => {
    //     console.log({ isPairStable });
    // }, [isPairStable]);

    // update local state with searchable tokens once after initial load of app
    useEffect(() => {
        // pull activeTokenLists from local storage and parse
        // do we need to add gatekeeping in case there is not a valid value?
        const { activeTokenLists } = JSON.parse(localStorage.getItem('user') as string);
        // update local state with array of all tokens from searchable lists
        setSearchableTokens(getTokensFromLists(activeTokenLists));
        // TODO:  this hook runs once after the initial load of the app, we may need to add
        // TODO:  additional triggers for DOM interactions
    }, [tokenListsReceived, activeTokenListsChanged]);

    function getTokensFromLists(tokenListURIs: Array<string>) {
        // retrieve and parse all token lists held in local storage
        const tokensFromLists = localStorage.allTokenLists
            ? JSON.parse(localStorage.getItem('allTokenLists') as string)
                  // remove all lists with URIs not included in the URIs array passed as argument
                  .filter((tokenList: TokenListIF) => tokenListURIs.includes(tokenList.uri ?? ''))
                  // extract array of tokens from active lists and flatten into single array
                  .map((tokenList: TokenListIF) => tokenList.tokens)
                  .flat()
            : defaultTokens;
        // return array of all tokens from lists as specified by token list URI
        return tokensFromLists;
    }

    // function to return array of all tokens on lists as specified by URI
    function getImportedTokens() {
        // see if there's a user object in local storage
        if (localStorage.user) {
            // if user object exists, pull it
            const user = JSON.parse(localStorage.getItem('user') as string);
            // if imported tokens are listed, hold in local state
            user.tokens && setImportedTokens(user.tokens);
        }
    }
    const [sidebarManuallySet, setSidebarManuallySet] = useState<boolean>(false);
    const [showSidebar, setShowSidebar] = useState<boolean>(false);

    const [lastBlockNumber, setLastBlockNumber] = useState<number>(0);

    const receiptData = useAppSelector((state) => state.receiptData);

    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

    const lastReceipt =
        receiptData?.sessionReceipts.length > 0
            ? JSON.parse(receiptData.sessionReceipts[receiptData.sessionReceipts.length - 1])
            : null;

    const isLastReceiptSuccess = lastReceipt?.confirmations >= 1;

    let snackMessage = '';
    if (lastReceipt) {
        snackMessage = `Transaction ${lastReceipt.transactionHash} successfully completed`;
    }

    const snackbarContent = (
        <SnackbarComponent
            severity={isLastReceiptSuccess ? 'info' : 'warning'}
            setOpenSnackbar={setOpenSnackbar}
            openSnackbar={openSnackbar}
        >
            {snackMessage}
        </SnackbarComponent>
    );

    useEffect(() => {
        if (lastReceipt) {
            setOpenSnackbar(true);
        }
    }, [JSON.stringify(lastReceipt)]);

    useEffect(() => {
        (async () => {
            if (window.ethereum) {
                const metamaskAccounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (metamaskAccounts?.length > 0) {
                    setMetamaskLocked(false);
                } else {
                    setMetamaskLocked(true);
                }
            }
        })();
    }, [window.ethereum, account]);

    const [ensName, setEnsName] = useState('');

    // check for ENS name account changes
    useEffect(() => {
        (async () => {
            if (account && provider) {
                try {
                    const ensName = await cachedFetchAddress(provider, account, chainData.chainId);
                    if (ensName) setEnsName(ensName);
                    else setEnsName('');
                } catch (error) {
                    setEnsName('');
                }
            }
        })();
    }, [account, chainData.chainId]);

    const tokensInRTK = useAppSelector((state) => state.tokenData.tokens);

    // check for token balances on each new block
    useEffect(() => {
        (async () => {
            if (isAuthenticated && account) {
                try {
                    const newTokens: TokenIF[] = await cachedFetchTokenBalances(
                        account,
                        chainData.chainId,
                        lastBlockNumber,
                    );
                    const tokensInRTKminusNative = tokensInRTK.slice(1);

                    if (
                        newTokens &&
                        (tokensInRTK.length === 1 ||
                            JSON.stringify(tokensInRTKminusNative) !== JSON.stringify(newTokens))
                    ) {
                        // console.log({ newTokens });
                        // console.log({ tokensInRTKminusNative });
                        dispatch(setTokens(newTokens));
                    }
                } catch (error) {
                    console.log({ error });
                }
            }
        })();
    }, [account, chainData.chainId, lastBlockNumber, tokensInRTK]);

    const [baseTokenAddress, setBaseTokenAddress] = useState<string>('');
    const [quoteTokenAddress, setQuoteTokenAddress] = useState<string>('');

    const [baseTokenDecimals, setBaseTokenDecimals] = useState<number>(0);
    const [quoteTokenDecimals, setQuoteTokenDecimals] = useState<number>(0);

    const [isTokenABase, setIsTokenABase] = useState<boolean>(true);

    // TODO:  @Emily useMemo() this value
    const tokenPair = {
        dataTokenA: tradeData.tokenA,
        dataTokenB: tradeData.tokenB,
    };

    const tokenPairStringified = useMemo(() => JSON.stringify(tokenPair), [tokenPair]);

    useEffect(() => {
        setPoolPriceDisplay(undefined);
    }, [baseTokenAddress, quoteTokenAddress]);

    // useEffect that runs when token pair changes
    useEffect(() => {
        // reset rtk values for user specified range in ticks
        dispatch(setAdvancedLowTick(0));
        dispatch(setAdvancedHighTick(0));

        if (tokenPair.dataTokenA.address && tokenPair.dataTokenB.address) {
            const sortedTokens = sortBaseQuoteTokens(
                tokenPair.dataTokenA.address,
                tokenPair.dataTokenB.address,
            );
            setBaseTokenAddress(sortedTokens[0]);
            setQuoteTokenAddress(sortedTokens[1]);
            if (tokenPair.dataTokenA.address === sortedTokens[0]) {
                setIsTokenABase(true);
                setBaseTokenDecimals(tokenPair.dataTokenA.decimals);
                setQuoteTokenDecimals(tokenPair.dataTokenB.decimals);
            } else {
                setIsTokenABase(false);
                setBaseTokenDecimals(tokenPair.dataTokenB.decimals);
                setQuoteTokenDecimals(tokenPair.dataTokenA.decimals);
            }

            try {
                if (httpGraphCacheServerDomain) {
                    const allPositionsCacheEndpoint =
                        httpGraphCacheServerDomain + '/pool_positions?';
                    fetch(
                        allPositionsCacheEndpoint +
                            new URLSearchParams({
                                base: sortedTokens[0].toLowerCase(),
                                quote: sortedTokens[1].toLowerCase(),
                                poolIdx: chainData.poolIndex.toString(),
                                chainId: chainData.chainId,
                            }),
                    )
                        .then((response) => response.json())
                        .then((json) => {
                            const poolPositions = json.data;

                            if (poolPositions) {
                                // console.log({ poolPositions });
                                Promise.all(poolPositions.map(getPositionData)).then(
                                    (updatedPositions) => {
                                        // console.log({ updatedPositions });
                                        if (
                                            JSON.stringify(graphData.positionsByUser.positions) !==
                                            JSON.stringify(updatedPositions)
                                        ) {
                                            dispatch(
                                                setPositionsByPool({
                                                    dataReceived: true,
                                                    positions: updatedPositions,
                                                }),
                                            );
                                        }
                                    },
                                );
                            }
                        })
                        .catch(console.log);
                }
            } catch (error) {
                console.log;
            }

            try {
                if (httpGraphCacheServerDomain) {
                    const poolSwapsCacheEndpoint = httpGraphCacheServerDomain + '/pool_swaps?';

                    fetch(
                        poolSwapsCacheEndpoint +
                            new URLSearchParams({
                                base: sortedTokens[0].toLowerCase(),
                                quote: sortedTokens[1].toLowerCase(),
                                poolIdx: chainData.poolIndex.toString(),
                                chainId: chainData.chainId,
                                // n: 10 // positive integer	(Optional.) If n and page are provided, query returns a page of results with at most n entries.
                                // page: 0 // nonnegative integer	(Optional.) If n and page are provided, query returns the page-th page of results. Page numbers are 0-indexed.
                            }),
                    )
                        .then((response) => response?.json())
                        .then((json) => {
                            const poolSwaps = json?.data;

                            console.log({ poolSwaps });

                            if (poolSwaps) {
                                Promise.all(poolSwaps.map(getSwapData)).then((updatedSwaps) => {
                                    if (
                                        JSON.stringify(graphData.swapsByUser.swaps) !==
                                        JSON.stringify(updatedSwaps)
                                    ) {
                                        dispatch(
                                            setSwapsByPool({
                                                dataReceived: true,
                                                swaps: updatedSwaps,
                                            }),
                                        );
                                    }
                                });
                            }
                        })
                        .catch(console.log);
                }
            } catch (error) {
                console.log;
            }
        }
    }, [tokenPairStringified, chainData.chainId]);

    const activePeriod = tradeData.activeChartPeriod;

    useEffect(() => {
        if (activePeriod) {
            try {
                if (httpGraphCacheServerDomain) {
                    const candleSeriesCacheEndpoint =
                        httpGraphCacheServerDomain + '/candle_series?';

                    fetch(
                        candleSeriesCacheEndpoint +
                            new URLSearchParams({
                                base: '0x0000000000000000000000000000000000000000',
                                quote: '0x6b175474e89094c44da98b954eedeac495271d0f',
                                poolIdx: '36000',
                                period: activePeriod.toString(),
                                dex: 'all',
                                n: '200', // positive integer
                                page: '0', // nonnegative integer
                                chainId: '0x1',
                            }),
                    )
                        .then((response) => response?.json())
                        .then((json) => {
                            const candles = json?.data;
                            // console.log({ candles });
                            if (candles) {
                                Promise.all(candles.map(getCandleData)).then((updatedCandles) => {
                                    // if (
                                    //     JSON.stringify(graphData.candlesForAllPools.pools) !==
                                    //     JSON.stringify(updatedCandles)
                                    // ) {
                                    dispatch(
                                        setCandles({
                                            pool: {
                                                baseAddress:
                                                    '0x0000000000000000000000000000000000000000',
                                                quoteAddress:
                                                    '0x6b175474e89094c44da98b954eedeac495271d0f',
                                                poolIdx: 36000,
                                                network: '0x1',
                                            },
                                            duration: activePeriod,
                                            candles: updatedCandles,
                                        }),
                                    );
                                    // }
                                });
                            }
                        })
                        .catch(console.log);
                }
            } catch (error) {
                console.log({ error });
            }
        }
    }, [activePeriod]);

    useEffect(() => {
        if (baseTokenAddress && quoteTokenAddress && activePeriod) {
            try {
                if (httpGraphCacheServerDomain) {
                    const candleSeriesCacheEndpoint =
                        httpGraphCacheServerDomain + '/candle_series?';

                    fetch(
                        candleSeriesCacheEndpoint +
                            new URLSearchParams({
                                base: baseTokenAddress.toLowerCase(),
                                quote: quoteTokenAddress.toLowerCase(),
                                poolIdx: chainData.poolIndex.toString(),
                                period: activePeriod.toString(),
                                // period: '86400', // 1 day
                                // period: '300', // 5 minute
                                // time: '1657833300', // optional
                                n: '200', // positive integer
                                page: '0', // nonnegative integer
                                chainId: chainData.chainId,
                            }),
                    )
                        .then((response) => response?.json())
                        .then((json) => {
                            const candles = json?.data;

                            if (candles) {
                                Promise.all(candles.map(getCandleData)).then((updatedCandles) => {
                                    if (
                                        JSON.stringify(graphData.candlesForAllPools.pools) !==
                                        JSON.stringify(updatedCandles)
                                    ) {
                                        dispatch(
                                            setCandles({
                                                pool: {
                                                    baseAddress: baseTokenAddress.toLowerCase(),
                                                    quoteAddress: quoteTokenAddress.toLowerCase(),
                                                    poolIdx: chainData.poolIndex,
                                                    network: chainData.chainId,
                                                },
                                                duration: activePeriod,
                                                candles: updatedCandles,
                                            }),
                                        );
                                    }
                                });
                            }
                        })
                        .catch(console.log);
                }
            } catch (error) {
                console.log({ error });
            }
        }
    }, [baseTokenAddress, quoteTokenAddress, activePeriod, chainData.chainId]);

    const allPositionsCacheSubscriptionEndpoint = useMemo(
        () =>
            wssGraphCacheServerDomain +
            '/subscribe_pool_positions?' +
            new URLSearchParams({
                base: baseTokenAddress.toLowerCase(),
                // baseTokenAddress.toLowerCase() || '0x0000000000000000000000000000000000000000',
                quote: quoteTokenAddress.toLowerCase(),
                // quoteTokenAddress.toLowerCase() || '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
                poolIdx: chainData.poolIndex.toString(),
                chainId: chainData.chainId,
            }),
        [baseTokenAddress, quoteTokenAddress, chainData.chainId],
    );

    const {
        //  sendMessage,
        lastMessage: lastAllPositionsMessage,
        //  readyState
    } = useWebSocket(
        allPositionsCacheSubscriptionEndpoint,
        {
            // share:  true,
            // onOpen: () => console.log('opened'),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClose: (event: any) => console.log({ event }),
            // onClose: () => console.log('allPositions websocket connection closed'),
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => shouldSubscriptionsReconnect,
        },
        // only connect if base/quote token addresses are available
        baseTokenAddress !== '' && quoteTokenAddress !== '',
    );

    useEffect(() => {
        if (lastAllPositionsMessage !== null) {
            const lastMessageData = JSON.parse(lastAllPositionsMessage.data).data;

            if (lastMessageData) {
                Promise.all(lastMessageData.map(getPositionData)).then((updatedPositions) => {
                    dispatch(
                        setPositionsByPool({
                            dataReceived: true,
                            positions: updatedPositions.concat(graphData.positionsByPool.positions),
                        }),
                    );
                });
            }
        }
    }, [lastAllPositionsMessage]);

    const candleSubscriptionEndpoint = useMemo(
        () =>
            wssGraphCacheServerDomain +
            '/subscribe_candles?' +
            new URLSearchParams({
                base: baseTokenAddress.toLowerCase(),
                // baseTokenAddress.toLowerCase() || '0x0000000000000000000000000000000000000000',
                quote: quoteTokenAddress.toLowerCase(),
                // quoteTokenAddress.toLowerCase() || '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
                poolIdx: chainData.poolIndex.toString(),
                // 	positive integer	The duration of the candle, in seconds. Must represent one of the following time intervals: 5 minutes, 15 minutes, 1 hour, 4 hours, 1 day, 7 days.
                period: activePeriod.toString(),
                // period: '60',
                chainId: chainData.chainId,
            }),
        [baseTokenAddress, quoteTokenAddress, chainData.poolIndex, activePeriod],
    );

    const {
        //  sendMessage,
        lastMessage: candlesMessage,
        //  readyState
    } = useWebSocket(
        candleSubscriptionEndpoint,
        {
            // share:  true,
            onOpen: () => console.log({ candleSubscriptionEndpoint }),
            onClose: (event) => console.log({ event }),
            // onClose: () => console.log('candles websocket connection closed'),
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => shouldSubscriptionsReconnect,
        },
        // only connect if base/quote token addresses are available
        baseTokenAddress !== '' && quoteTokenAddress !== '',
    );

    useEffect(() => {
        if (candlesMessage !== null) {
            const lastMessageData = JSON.parse(candlesMessage.data).data;
            if (lastMessageData) {
                // console.log({ lastMessageData });
                Promise.all(lastMessageData.map(getCandleData)).then((updatedCandles) => {
                    // console.log({ updatedCandles });
                    dispatch(
                        addCandles({
                            pool: {
                                baseAddress: baseTokenAddress,
                                quoteAddress: quoteTokenAddress,
                                poolIdx: chainData.poolIndex,
                                network: chainData.chainId,
                            },
                            duration: activePeriod,
                            candles: updatedCandles,
                        }),
                    );
                });
            }
            // console.log({ lastMessageData });
        }
    }, [candlesMessage]);

    const mainnetCandleSubscriptionEndpoint = useMemo(
        () =>
            wssGraphCacheServerDomain +
            '/subscribe_candles?' +
            new URLSearchParams({
                base: '0x0000000000000000000000000000000000000000',
                quote: '0x6b175474e89094c44da98b954eedeac495271d0f',
                poolIdx: chainData.poolIndex.toString(),
                // 	positive integer	The duration of the candle, in seconds. Must represent one of the following time intervals: 5 minutes, 15 minutes, 1 hour, 4 hours, 1 day, 7 days.
                period: activePeriod.toString(),
                chainId: '0x1',
                dex: 'all',
            }),
        [baseTokenAddress, quoteTokenAddress, chainData.poolIndex, activePeriod, chainData.chainId],
    );

    const {
        //  sendMessage,
        lastMessage: mainnetCandlesMessage,
        //  readyState
    } = useWebSocket(
        mainnetCandleSubscriptionEndpoint,
        {
            // share:  true,
            onOpen: () => console.log({ mainnetCandleSubscriptionEndpoint }),
            onClose: (event) => console.log({ event }),
            // onClose: () => console.log('candles websocket connection closed'),
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => shouldSubscriptionsReconnect,
        },
        // only connect if base/quote token addresses are available
        // baseTokenAddress !== '' && quoteTokenAddress !== '',
    );

    useEffect(() => {
        if (mainnetCandlesMessage !== null) {
            const lastMessageData = JSON.parse(mainnetCandlesMessage.data).data;
            if (lastMessageData) {
                // console.log({ lastMessageData });
                Promise.all(lastMessageData.map(getCandleData)).then((updatedCandles) => {
                    // console.log({ updatedCandles });
                    dispatch(
                        addCandles({
                            pool: {
                                baseAddress: '0x0000000000000000000000000000000000000000',
                                quoteAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
                                poolIdx: 36000,
                                network: '0x1',
                            },
                            duration: activePeriod,
                            candles: updatedCandles,
                        }),
                    );
                });
            }
            // console.log({ lastMessageData });
        }
    }, [mainnetCandlesMessage]);

    const poolSwapsCacheSubscriptionEndpoint = useMemo(
        () =>
            wssGraphCacheServerDomain +
            '/subscribe_pool_swaps?' +
            new URLSearchParams({
                base: baseTokenAddress.toLowerCase(),
                // baseTokenAddress.toLowerCase() || '0x0000000000000000000000000000000000000000',
                quote: quoteTokenAddress.toLowerCase(),
                // quoteTokenAddress.toLowerCase() || '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
                poolIdx: chainData.poolIndex.toString(),
                chainId: chainData.chainId,
            }),
        [baseTokenAddress, quoteTokenAddress, chainData.chainId],
    );

    const {
        //  sendMessage,
        lastMessage: lastPoolSwapsMessage,
        //  readyState
    } = useWebSocket(
        poolSwapsCacheSubscriptionEndpoint,
        {
            // share:  true,
            // onOpen: () => console.log('opened'),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClose: (event: any) => console.log({ event }),
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => shouldSubscriptionsReconnect,
        },
        // only connect if base/quote token addresses are available
        baseTokenAddress !== '' && quoteTokenAddress !== '',
    );

    useEffect(() => {
        if (lastPoolSwapsMessage !== null) {
            const lastMessageData = JSON.parse(lastPoolSwapsMessage.data).data;

            if (lastMessageData) {
                Promise.all(lastMessageData.map(getSwapData)).then((updatedSwaps) => {
                    dispatch(
                        setSwapsByPool({
                            dataReceived: true,
                            swaps: updatedSwaps.concat(graphData.swapsByPool.swaps),
                        }),
                    );
                });
            }
        }
    }, [lastPoolSwapsMessage]);

    const userPositionsCacheSubscriptionEndpoint = useMemo(
        () =>
            wssGraphCacheServerDomain +
            '/subscribe_user_positions?' +
            new URLSearchParams({
                user: account || '',
                chainId: chainData.chainId,
                // user: account || '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            }),
        [account, chainData.chainId],
    );

    const {
        //  sendMessage,
        lastMessage: lastUserPositionsMessage,
        //  readyState
    } = useWebSocket(
        userPositionsCacheSubscriptionEndpoint,
        {
            // share: true,
            // onOpen: () => console.log('opened'),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClose: (event: any) => console.log({ event }),
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => shouldSubscriptionsReconnect,
        },
        // only connect is account is available
        account !== null && account !== '',
    );

    useEffect(() => {
        if (lastUserPositionsMessage !== null) {
            const lastMessageData = JSON.parse(lastUserPositionsMessage.data).data;

            if (lastMessageData) {
                Promise.all(lastMessageData.map(getPositionData)).then((updatedPositions) => {
                    dispatch(
                        setPositionsByUser({
                            dataReceived: true,
                            positions: updatedPositions.concat(graphData.positionsByUser.positions),
                        }),
                    );
                });
            }
        }
    }, [lastUserPositionsMessage]);

    const userSwapsCacheSubscriptionEndpoint = useMemo(
        () =>
            wssGraphCacheServerDomain +
            '/subscribe_user_swaps?' +
            new URLSearchParams({
                user: account || '',
                chainId: chainData.chainId,
            }),
        [account, chainData.chainId],
    );

    const { lastMessage: lastUserSwapsMessage } = useWebSocket(
        userSwapsCacheSubscriptionEndpoint,
        {
            // share: true,
            // onOpen: () => console.log('opened'),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClose: (event: any) => console.log({ event }),
            // onClose: () => console.log('userSwaps websocket connection closed'),
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => shouldSubscriptionsReconnect,
        },
        // only connect is account is available
        account !== null && account !== '',
    );

    useEffect(() => {
        if (lastUserSwapsMessage !== null) {
            const lastMessageData = JSON.parse(lastUserSwapsMessage.data).data;
            if (lastMessageData) {
                Promise.all(lastMessageData.map(getSwapData)).then((updatedSwaps) => {
                    dispatch(
                        setSwapsByUser({
                            dataReceived: true,
                            swaps: updatedSwaps.concat(graphData.swapsByUser.swaps),
                        }),
                    );
                });
            }
        }
    }, [lastUserSwapsMessage]);

    const [tokenABalance, setTokenABalance] = useState<string>('');
    const [tokenBBalance, setTokenBBalance] = useState<string>('');
    const [poolPriceNonDisplay, setPoolPriceNonDisplay] = useState<number | undefined>(undefined);
    const [poolPriceDisplay, setPoolPriceDisplay] = useState<number | undefined>(undefined);

    // useEffect to get spot price when tokens change and block updates
    useEffect(() => {
        if (
            baseTokenAddress &&
            quoteTokenAddress &&
            baseTokenDecimals &&
            quoteTokenDecimals &&
            lastBlockNumber !== 0
        ) {
            (async () => {
                const viewProvider = provider
                    ? provider
                    : (await new CrocEnv(chainData.chainId).context).provider;

                const spotPrice = await querySpotPrice(
                    viewProvider,
                    baseTokenAddress,
                    quoteTokenAddress,
                    chainData.chainId,
                    lastBlockNumber,
                );

                setPoolPriceNonDisplay(spotPrice);
                if (spotPrice) {
                    const displayPrice = toDisplayPrice(
                        spotPrice,
                        baseTokenDecimals,
                        quoteTokenDecimals,
                    );
                    setPoolPriceDisplay(displayPrice);
                } else {
                    setPoolPriceDisplay(0);
                }
            })();
        }
    }, [
        lastBlockNumber,
        baseTokenAddress,
        quoteTokenAddress,
        baseTokenDecimals,
        quoteTokenDecimals,
        chainData.chainId,
        provider,
    ]);

    // useEffect to update selected token balances
    useEffect(() => {
        (async () => {
            if (
                provider &&
                account &&
                isAuthenticated &&
                isWeb3Enabled &&
                tokenPair?.dataTokenA?.address &&
                tokenPair?.dataTokenB?.address
            ) {
                const croc = new CrocEnv(provider);
                croc.token(tokenPair.dataTokenA.address)
                    .balanceDisplay(account)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .then((bal: any) => setTokenABalance(bal));
                croc.token(tokenPair.dataTokenB.address)
                    .balanceDisplay(account)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .then((bal: any) => setTokenBBalance(bal));
            }
        })();
    }, [
        chainData.chainId,
        account,
        isWeb3Enabled,
        isAuthenticated,
        tokenPair?.dataTokenA?.address,
        tokenPair?.dataTokenB?.address,
        lastBlockNumber,
        provider,
    ]);

    const [tokenAAllowance, setTokenAAllowance] = useState<string>('');
    const [tokenBAllowance, setTokenBAllowance] = useState<string>('');

    const [recheckTokenAApproval, setRecheckTokenAApproval] = useState<boolean>(false);
    const [recheckTokenBApproval, setRecheckTokenBApproval] = useState<boolean>(false);

    // useEffect to check if user has approved CrocSwap to sell the token A
    useEffect(() => {
        (async () => {
            if (tokenPair?.dataTokenA?.address) {
                try {
                    const tokenAAddress = tokenPair.dataTokenA.address;
                    if (provider && isWeb3Enabled && account !== null) {
                        const crocEnv = new CrocEnv(provider);
                        const allowance = await crocEnv.token(tokenAAddress).allowance(account);
                        setTokenAAllowance(toDisplayQty(allowance, tokenPair.dataTokenA.decimals));
                    }
                } catch (err) {
                    console.log(err);
                }
                setRecheckTokenAApproval(false);
            }
        })();
    }, [
        tokenPair?.dataTokenA?.address,
        lastBlockNumber,
        account,
        provider,
        isWeb3Enabled,
        recheckTokenAApproval,
        account,
    ]);

    // useEffect to check if user has approved CrocSwap to sell the token B
    useEffect(() => {
        (async () => {
            if (tokenPair?.dataTokenB?.address) {
                try {
                    const tokenBAddress = tokenPair.dataTokenB.address;
                    if (provider && isWeb3Enabled && account !== null) {
                        const crocEnv = new CrocEnv(provider);
                        const allowance = await crocEnv.token(tokenBAddress).allowance(account);
                        setTokenBAllowance(toDisplayQty(allowance, tokenPair.dataTokenB.decimals));
                    }
                } catch (err) {
                    console.log(err);
                }
                setRecheckTokenBApproval(false);
            }
        })();
    }, [
        tokenPair?.dataTokenB?.address,
        lastBlockNumber,
        account,
        provider,
        isWeb3Enabled,
        recheckTokenBApproval,
    ]);

    const graphData = useAppSelector((state) => state.graphData);

    const getSwapData = async (swap: ISwap): Promise<ISwap> => {
        swap.base = swap.base.startsWith('0x') ? swap.base : '0x' + swap.base;
        swap.quote = swap.quote.startsWith('0x') ? swap.quote : '0x' + swap.quote;
        swap.user = swap.user.startsWith('0x') ? swap.user : '0x' + swap.user;
        swap.id = '0x' + swap.id.slice(6);

        return swap;
    };

    const getCandleData = async (candle: CandleData): Promise<CandleData> => {
        return candle;
    };

    const getPositionData = async (position: PositionIF): Promise<PositionIF> => {
        position.base = position.base.startsWith('0x') ? position.base : '0x' + position.base;
        position.quote = position.quote.startsWith('0x') ? position.quote : '0x' + position.quote;
        position.user = position.user.startsWith('0x') ? position.user : '0x' + position.user;

        const baseTokenAddress = position.base;
        const quoteTokenAddress = position.quote;

        const viewProvider = provider
            ? provider
            : (await new CrocEnv(chainData.chainId).context).provider;
        const poolPriceNonDisplay = await cachedQuerySpotPrice(
            viewProvider,
            baseTokenAddress,
            quoteTokenAddress,
            chainData.chainId,
            lastBlockNumber,
        );

        try {
            const ensName = await cachedFetchAddress(
                viewProvider,
                position.user,
                chainData.chainId,
            );
            if (ensName) position.userEnsName = ensName;
        } catch (error) {
            console.warn(error);
        }

        const poolPriceInTicks = Math.log(poolPriceNonDisplay) / Math.log(1.0001);

        const baseTokenDecimals = await cachedGetTokenDecimals(
            viewProvider,
            baseTokenAddress,
            chainData.chainId,
        );
        const quoteTokenDecimals = await cachedGetTokenDecimals(
            viewProvider,
            quoteTokenAddress,
            chainData.chainId,
        );

        if (baseTokenDecimals) position.baseTokenDecimals = baseTokenDecimals;
        if (quoteTokenDecimals) position.quoteTokenDecimals = quoteTokenDecimals;

        const lowerPriceNonDisplay = tickToPrice(position.bidTick);
        const upperPriceNonDisplay = tickToPrice(position.askTick);

        const lowerPriceDisplayInBase =
            1 / toDisplayPrice(upperPriceNonDisplay, baseTokenDecimals, quoteTokenDecimals);

        const upperPriceDisplayInBase =
            1 / toDisplayPrice(lowerPriceNonDisplay, baseTokenDecimals, quoteTokenDecimals);

        const lowerPriceDisplayInQuote = toDisplayPrice(
            lowerPriceNonDisplay,
            baseTokenDecimals,
            quoteTokenDecimals,
        );

        const upperPriceDisplayInQuote = toDisplayPrice(
            upperPriceNonDisplay,
            baseTokenDecimals,
            quoteTokenDecimals,
        );

        position.lowRangeShortDisplayInBase =
            lowerPriceDisplayInBase < 0.0001
                ? lowerPriceDisplayInBase.toExponential(2)
                : lowerPriceDisplayInBase < 2
                ? lowerPriceDisplayInBase.toPrecision(3)
                : lowerPriceDisplayInBase >= 1000000
                ? lowerPriceDisplayInBase.toExponential(2)
                : lowerPriceDisplayInBase.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                  });

        position.lowRangeShortDisplayInQuote =
            lowerPriceDisplayInQuote < 0.0001
                ? lowerPriceDisplayInQuote.toExponential(2)
                : lowerPriceDisplayInQuote < 2
                ? lowerPriceDisplayInQuote.toPrecision(3)
                : lowerPriceDisplayInQuote >= 1000000
                ? lowerPriceDisplayInQuote.toExponential(2)
                : lowerPriceDisplayInQuote.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                  });

        position.highRangeShortDisplayInBase =
            upperPriceDisplayInBase < 0.0001
                ? upperPriceDisplayInBase.toExponential(2)
                : upperPriceDisplayInBase < 2
                ? upperPriceDisplayInBase.toPrecision(3)
                : upperPriceDisplayInBase >= 1000000
                ? upperPriceDisplayInBase.toExponential(2)
                : upperPriceDisplayInBase.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                  });

        position.highRangeShortDisplayInQuote =
            upperPriceDisplayInQuote < 0.0001
                ? upperPriceDisplayInQuote.toExponential(2)
                : upperPriceDisplayInQuote < 2
                ? upperPriceDisplayInQuote.toPrecision(3)
                : upperPriceDisplayInQuote >= 1000000
                ? upperPriceDisplayInQuote.toExponential(2)
                : upperPriceDisplayInQuote.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                  });

        const baseTokenLogoURI = importedTokens.find(
            (token) => token.address.toLowerCase() === baseTokenAddress.toLowerCase(),
        )?.logoURI;
        const quoteTokenLogoURI = importedTokens.find(
            (token) => token.address.toLowerCase() === quoteTokenAddress.toLowerCase(),
        )?.logoURI;

        position.baseTokenLogoURI = baseTokenLogoURI ?? '';
        position.quoteTokenLogoURI = quoteTokenLogoURI ?? '';

        if (!position.ambient) {
            position.lowRangeDisplayInBase =
                lowerPriceDisplayInBase < 0.0001
                    ? lowerPriceDisplayInBase.toExponential(2)
                    : lowerPriceDisplayInBase < 2
                    ? lowerPriceDisplayInBase.toPrecision(3)
                    : lowerPriceDisplayInBase >= 1000000
                    ? lowerPriceDisplayInBase.toExponential(2)
                    : lowerPriceDisplayInBase.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });
            position.highRangeDisplayInBase =
                upperPriceDisplayInBase < 0.0001
                    ? upperPriceDisplayInBase.toExponential(2)
                    : upperPriceDisplayInBase < 2
                    ? upperPriceDisplayInBase.toPrecision(3)
                    : upperPriceDisplayInBase >= 1000000
                    ? upperPriceDisplayInBase.toExponential(2)
                    : upperPriceDisplayInBase.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });
        }

        if (!position.ambient) {
            position.lowRangeDisplayInQuote =
                lowerPriceDisplayInQuote < 0.0001
                    ? lowerPriceDisplayInQuote.toExponential(2)
                    : lowerPriceDisplayInQuote < 2
                    ? lowerPriceDisplayInQuote.toPrecision(3)
                    : lowerPriceDisplayInQuote >= 1000000
                    ? lowerPriceDisplayInQuote.toExponential(2)
                    : lowerPriceDisplayInQuote.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });
            position.highRangeDisplayInQuote =
                upperPriceDisplayInQuote < 0.0001
                    ? upperPriceDisplayInQuote.toExponential(2)
                    : upperPriceDisplayInQuote < 2
                    ? upperPriceDisplayInQuote.toPrecision(3)
                    : upperPriceDisplayInQuote >= 1000000
                    ? upperPriceDisplayInQuote.toExponential(2)
                    : upperPriceDisplayInQuote.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });
        }

        position.poolPriceInTicks = poolPriceInTicks;
        return position;
    };

    useEffect(() => {
        if (isAuthenticated && account) {
            const allUserPositionsCacheEndpoint = httpGraphCacheServerDomain + '/user_positions?';

            try {
                fetch(
                    allUserPositionsCacheEndpoint +
                        new URLSearchParams({
                            user: account,
                            chainId: chainData.chainId,
                        }),
                )
                    .then((response) => response?.json())
                    .then((json) => {
                        const userPositions = json?.data;

                        if (userPositions) {
                            Promise.all(userPositions.map(getPositionData)).then(
                                (updatedPositions) => {
                                    if (
                                        JSON.stringify(graphData.positionsByUser.positions) !==
                                        JSON.stringify(updatedPositions)
                                    ) {
                                        dispatch(
                                            setPositionsByUser({
                                                dataReceived: true,
                                                positions: updatedPositions,
                                            }),
                                        );
                                    }
                                },
                            );
                        }
                    })
                    .catch(console.log);
            } catch (error) {
                console.log;
            }

            try {
                const allUserSwapsCacheEndpoint = httpGraphCacheServerDomain + '/user_swaps?';
                console.log('fetching user swaps');
                fetch(
                    allUserSwapsCacheEndpoint +
                        new URLSearchParams({
                            user: account,
                            chainId: chainData.chainId,
                        }),
                )
                    .then((response) => response?.json())
                    .then((json) => {
                        const userSwaps = json?.data;

                        if (userSwaps) {
                            Promise.all(userSwaps.map(getSwapData)).then((updatedSwaps) => {
                                if (
                                    JSON.stringify(graphData.swapsByUser.swaps) !==
                                    JSON.stringify(updatedSwaps)
                                ) {
                                    dispatch(
                                        setSwapsByUser({
                                            dataReceived: true,
                                            swaps: updatedSwaps,
                                        }),
                                    );
                                }
                            });
                        }
                    })
                    .catch(console.log);
            } catch (error) {
                console.log;
            }
        }
    }, [isAuthenticated, account, chainData.chainId]);

    // run function to initialize local storage
    // internal controls will only initialize values that don't exist
    // existing values will not be overwritten

    // determine whether the user is connected to a supported chain
    // the user being connected to a non-supported chain or not being
    // ... connected at all are both reflected as `false`
    // later we can make this available to the rest of the app through
    // ... the React Router context provider API
    // const isChainValid = chainData.chainId ? validateChain(chainData.chainId as string) : false;

    const currentLocation = location.pathname;

    function toggleSidebarBasedOnRoute() {
        if (sidebarManuallySet) {
            return;
        } else {
            setShowSidebar(true);
            if (currentLocation === '/' || currentLocation === '/swap') {
                setShowSidebar(false);
            }
        }
    }

    useEffect(() => toggleSidebarBasedOnRoute(), [location]);

    const [nativeBalance, setNativeBalance] = useState<string>('');

    // function to sever connection between user wallet and Moralis server
    const clickLogout = async () => {
        setNativeBalance('');
        setTokenABalance('0');
        setTokenBBalance('0');
        dispatch(resetTradeData());
        dispatch(resetTokenData());
        dispatch(resetGraphData());
        dispatch(resetReceiptData());
        dispatch(resetTokenData());

        await logout();
    };

    // TODO: this may work better as a useMemo... play with it a bit
    // this is how we run the function to pull back balances asynchronously
    useEffect(() => {
        (async () => {
            if (provider && account && isAuthenticated && isWeb3Enabled) {
                // console.log('Provider Native Balance');
                // console.dir(provider);
                // console.log(
                //     provider
                //         .getBalance('0x01e650ABfc761C6A0Fc60f62A4E4b3832bb1178b')
                //         .then(console.log),
                // );
                new CrocEnv(provider)
                    .tokenEth()
                    .balance(account)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .then((eth: any) => {
                        const displayBalance = toDisplayQty(eth.toString(), 18);
                        if (displayBalance) setNativeBalance(displayBalance);

                        const nativeToken: TokenIF = {
                            name: 'Native Token',

                            address: '0x0000000000000000000000000000000000000000',
                            // eslint-disable-next-line camelcase
                            token_address: '0x0000000000000000000000000000000000000000',
                            symbol: 'ETH',
                            decimals: 18,
                            chainId: parseInt(chainData.chainId),
                            logoURI: '',
                            balance: eth.toString(),
                        };
                        if (JSON.stringify(tokensInRTK[0]) !== JSON.stringify(nativeToken))
                            dispatch(addNativeBalance([nativeToken]));
                    });
            }
        })();
    }, [provider, account, isWeb3Enabled, isAuthenticated, lastBlockNumber]);

    const [gasPriceinGwei, setGasPriceinGwei] = useState<string>('');

    useEffect(() => {
        fetch(
            'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=KNJM7A9ST1Q1EESYXPPQITIP7I8EFSY456',
        )
            .then((response) => response.json())
            .then((response) => {
                if (response.result.ProposeGasPrice) {
                    setGasPriceinGwei(response.result.ProposeGasPrice);
                }
            })
            .catch(console.log);
    }, [lastBlockNumber]);

    // useEffect to get current block number
    // on a 10 second interval
    // currently displayed in footer
    useEffect(() => {
        const interval = setInterval(async () => {
            const currentDateTime = new Date().toISOString();
            const chain = chainData.chainId;
            const options = {
                chain: chain as 'goerli', // Cheat and narrow type. We know chain string matches Moralis' chain union type
                date: currentDateTime,
            };
            const currentBlock = (await Moralis.Web3API.native.getDateToBlock(options)).block;
            if (currentBlock !== lastBlockNumber) {
                setLastBlockNumber(currentBlock);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [chainData.chainId, lastBlockNumber]);

    const shouldDisplayAccountTab = isAuthenticated && isWeb3Enabled && account != '';

    // props for <PageHeader/> React element
    const headerProps = {
        nativeBalance: nativeBalance,
        clickLogout: clickLogout,
        metamaskLocked: metamaskLocked,
        ensName: ensName,
        shouldDisplayAccountTab: shouldDisplayAccountTab,
        chainId: chainData.chainId,
        isChainSupported: isChainSupported,
        switchChain: switchChain,
        switchNetworkInMoralis: switchNetworkInMoralis,
    };

    // props for <Swap/> React element
    const swapProps = {
        importedTokens: importedTokens,
        setImportedTokens: setImportedTokens,
        searchableTokens: searchableTokens,
        provider: provider,
        swapSlippage: swapSlippage,
        isPairStable: isPairStable,
        gasPriceinGwei: gasPriceinGwei,
        nativeBalance: nativeBalance,
        lastBlockNumber: lastBlockNumber,
        tokenABalance: tokenABalance,
        tokenBBalance: tokenBBalance,
        isSellTokenBase: isTokenABase,
        tokenPair: tokenPair,
        poolPriceDisplay: poolPriceDisplay,
        tokenAAllowance: tokenAAllowance,
        setRecheckTokenAApproval: setRecheckTokenAApproval,
        chainId: chainData.chainId,
        activeTokenListsChanged: activeTokenListsChanged,
        indicateActiveTokenListsChanged: indicateActiveTokenListsChanged,
    };

    // props for <Swap/> React element on trade route
    const swapPropsTrade = {
        importedTokens: importedTokens,
        setImportedTokens: setImportedTokens,
        searchableTokens: searchableTokens,
        provider: provider,
        swapSlippage: swapSlippage,
        isPairStable: isPairStable,
        isOnTradeRoute: true,
        gasPriceinGwei: gasPriceinGwei,
        nativeBalance: nativeBalance,
        lastBlockNumber: lastBlockNumber,
        tokenABalance: tokenABalance,
        tokenBBalance: tokenBBalance,
        isSellTokenBase: isTokenABase,
        tokenPair: tokenPair,
        poolPriceDisplay: poolPriceDisplay,
        setRecheckTokenAApproval: setRecheckTokenAApproval,
        tokenAAllowance: tokenAAllowance,
        chainId: chainData.chainId,
        activeTokenListsChanged: activeTokenListsChanged,
        indicateActiveTokenListsChanged: indicateActiveTokenListsChanged,
    };

    // props for <Limit/> React element on trade route
    const limitPropsTrade = {
        importedTokens: importedTokens,
        setImportedTokens: setImportedTokens,
        searchableTokens: searchableTokens,
        provider: provider,
        mintSlippage: mintSlippage,
        isPairStable: isPairStable,
        isOnTradeRoute: true,
        gasPriceinGwei: gasPriceinGwei,
        nativeBalance: nativeBalance,
        lastBlockNumber: lastBlockNumber,
        tokenABalance: tokenABalance,
        tokenBBalance: tokenBBalance,
        isSellTokenBase: isTokenABase,
        tokenPair: tokenPair,
        isTokenABase: isTokenABase,
        poolPriceDisplay: poolPriceDisplay,
        poolPriceNonDisplay: poolPriceNonDisplay,
        setRecheckTokenAApproval: setRecheckTokenAApproval,
        tokenAAllowance: tokenAAllowance,
        chainId: chainData.chainId,
        activeTokenListsChanged: activeTokenListsChanged,
        indicateActiveTokenListsChanged: indicateActiveTokenListsChanged,
    };

    // props for <Range/> React element
    const rangeProps = {
        importedTokens: importedTokens,
        setImportedTokens: setImportedTokens,
        searchableTokens: searchableTokens,
        provider: provider,
        mintSlippage: mintSlippage,
        isPairStable: isPairStable,
        lastBlockNumber: lastBlockNumber,
        gasPriceinGwei: gasPriceinGwei,
        baseTokenAddress: baseTokenAddress,
        quoteTokenAddress: quoteTokenAddress,
        poolPriceNonDisplay: poolPriceNonDisplay,
        poolPriceDisplay: poolPriceDisplay ? poolPriceDisplay.toString() : '0',
        tokenABalance: tokenABalance,
        tokenAAllowance: tokenAAllowance,
        setRecheckTokenAApproval: setRecheckTokenAApproval,
        tokenBBalance: tokenBBalance,
        tokenBAllowance: tokenBAllowance,
        setRecheckTokenBApproval: setRecheckTokenBApproval,
        chainId: chainData.chainId,
        activeTokenListsChanged: activeTokenListsChanged,
        indicateActiveTokenListsChanged: indicateActiveTokenListsChanged,
    };

    function toggleSidebar() {
        setShowSidebar(!showSidebar);
        setSidebarManuallySet(true);
    }

    function handleSetTradeTabToTransaction() {
        setSwitchTabToTransactions(!switchTabToTransactions);
    }

    function handleSetTradeTabToOrders() {
        setSwitchTabToOrders(!switchTabToOrders);
    }
    const [selectedOutsideTab, setSelectedOutsideTab] = useState(0);
    const [outsideControl, setOutsideControl] = useState(false);

    // props for <Sidebar/> React element
    const sidebarProps = {
        isDenomBase: tradeData.isDenomBase,
        showSidebar: showSidebar,
        toggleSidebar: toggleSidebar,
        chainId: chainData.chainId,
        switchTabToTransactions: switchTabToTransactions,
        handleSetTradeTabToTransaction: handleSetTradeTabToTransaction,
        setSwitchTabToTransactions: setSwitchTabToTransactions,

        currentTxActiveInTransactions: currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions: setCurrentTxActiveInTransactions,
        isShowAllEnabled: isShowAllEnabled,
        setIsShowAllEnabled: setIsShowAllEnabled,
        expandTradeTable: expandTradeTable,
        setExpandTradeTable: setExpandTradeTable,
        tokenMap: tokenMap,
        lastBlockNumber: lastBlockNumber,

        switchTabToOrders: switchTabToOrders,
        setSwitchTabToOrders: setSwitchTabToOrders,
        handleSetTradeTabToOrders: handleSetTradeTabToOrders,

        selectedOutsideTab: selectedOutsideTab,
        setSelectedOutsideTab: setSelectedOutsideTab,
        outsideControl: outsideControl,
        setOutsideControl: setOutsideControl,

        // setShowSidebar : setShowSidebar
    };

    const analyticsProps = {
        setSelectedOutsideTab: setSelectedOutsideTab,
        setOutsideControl: setOutsideControl,
    };

    function updateDenomIsInBase() {
        // console.log('------------');
        // we need to know if the denom token is base or quote
        // currently the denom token is the cheaper one by default
        // ergo we need to know if the cheaper token is base or quote
        // whether pool price is greater or less than 1 indicates which is more expensive
        // if pool price is < 0.1 then denom token will be quote (cheaper one)
        // if pool price is > 0.1 then denom token will be base (also cheaper one)
        // then reverse if didUserToggleDenom === true
        const isDenomInBase =
            poolPriceDisplay && poolPriceDisplay < 1
                ? tradeData.didUserFlipDenom
                    ? false
                    : true
                : tradeData.didUserFlipDenom
                ? true
                : false;
        return isDenomInBase;
    }

    useEffect(() => {
        const isDenomBase = updateDenomIsInBase();
        if (tradeData.isDenomBase !== isDenomBase) {
            dispatch(setDenomInBase(isDenomBase));
        }
    }, [tradeData.didUserFlipDenom, tokenPair]);

    const [imageData, setImageData] = useState<string[]>([]);

    useEffect(() => {
        (async () => {
            if (account) {
                const imageLocalURLs = await getNFTs(account);
                if (imageLocalURLs) setImageData(imageLocalURLs);
            }
        })();
    }, [account]);

    // const mainLayoutStyle = showSidebar ? 'main-layout-2' : 'main-layout';
    // take away margin from left if we are on homepage or swap

    const swapBodyStyle = currentLocation == '/swap' ? 'swap-body' : null;

    // Show sidebar on all pages except for home and swap
    const sidebarRender = currentLocation !== '/' &&
        currentLocation !== '/swap' &&
        currentLocation !== '/404' && <Sidebar {...sidebarProps} />;

    const sidebarDislayStyle = showSidebar
        ? 'sidebar_content_layout'
        : 'sidebar_content_layout_close';

    const showSidebarOrNullStyle =
        currentLocation == '/' || currentLocation == '/swap' || currentLocation == '/404'
            ? 'hide_sidebar'
            : sidebarDislayStyle;

    const containerStyle = currentLocation.includes('trade')
        ? 'content-container-trade'
        : 'content-container';

    return (
        <>
            <div className={containerStyle}>
                {currentLocation !== '/404' && <PageHeader {...headerProps} />}
                <main className={`${showSidebarOrNullStyle} ${swapBodyStyle}`}>
                    {sidebarRender}
                    <Routes>
                        <Route
                            index
                            element={
                                <Home
                                    tokenMap={tokenMap}
                                    lastBlockNumber={lastBlockNumber}
                                    provider={provider}
                                    chainId={chainData.chainId}
                                />
                            }
                        />
                        <Route
                            path='trade'
                            element={
                                <Trade
                                    provider={provider}
                                    tokenPair={tokenPair}
                                    account={account ?? ''}
                                    isAuthenticated={isAuthenticated}
                                    isWeb3Enabled={isWeb3Enabled}
                                    lastBlockNumber={lastBlockNumber}
                                    isTokenABase={isTokenABase}
                                    poolPriceDisplay={poolPriceDisplay}
                                    chainId={chainData.chainId}
                                    switchTabToTransactions={switchTabToTransactions}
                                    setSwitchTabToTransactions={setSwitchTabToTransactions}
                                    currentTxActiveInTransactions={currentTxActiveInTransactions}
                                    setCurrentTxActiveInTransactions={
                                        setCurrentTxActiveInTransactions
                                    }
                                    isShowAllEnabled={isShowAllEnabled}
                                    setIsShowAllEnabled={setIsShowAllEnabled}
                                    expandTradeTable={expandTradeTable}
                                    setExpandTradeTable={setExpandTradeTable}
                                    tokenMap={tokenMap}
                                    switchTabToOrders={switchTabToOrders}
                                    setSwitchTabToOrders={setSwitchTabToOrders}
                                    selectedOutsideTab={selectedOutsideTab}
                                    setSelectedOutsideTab={setSelectedOutsideTab}
                                    outsideControl={outsideControl}
                                    setOutsideControl={setOutsideControl}
                                />
                            }
                        >
                            <Route path='' element={<Swap {...swapPropsTrade} />} />
                            <Route path='market' element={<Swap {...swapPropsTrade} />} />
                            <Route path='limit' element={<Limit {...limitPropsTrade} />} />
                            <Route path='range' element={<Range {...rangeProps} />} />
                            <Route path='edit/:positionHash' element={<Edit />} />
                            <Route path='reposition' element={<Reposition />} />
                            <Route path='edit/' element={<Navigate to='/trade/market' replace />} />
                        </Route>
                        <Route path='analytics' element={<Analytics {...analyticsProps} />} />
                        <Route path='tokens/:address' element={<TokenPage />} />
                        <Route path='pools/:address' element={<PoolPage />} />

                        <Route path='range2' element={<Range {...rangeProps} />} />

                        <Route
                            path='account'
                            element={
                                <Portfolio
                                    ensName={ensName}
                                    connectedAccount={account ? account : ''}
                                    userImageData={imageData}
                                    chainId={chainData.chainId}
                                    tokenMap={tokenMap}
                                    switchTabToTransactions={switchTabToTransactions}
                                    setSwitchTabToTransactions={setSwitchTabToTransactions}
                                    selectedOutsideTab={selectedOutsideTab}
                                    setSelectedOutsideTab={setSelectedOutsideTab}
                                    outsideControl={outsideControl}
                                    setOutsideControl={setOutsideControl}
                                />
                            }
                        />
                        <Route
                            path='account/:address'
                            element={
                                <Portfolio
                                    ensName={ensName}
                                    connectedAccount={account ? account : ''}
                                    chainId={chainData.chainId}
                                    userImageData={imageData}
                                    tokenMap={tokenMap}
                                    switchTabToTransactions={switchTabToTransactions}
                                    setSwitchTabToTransactions={setSwitchTabToTransactions}
                                    selectedOutsideTab={selectedOutsideTab}
                                    setSelectedOutsideTab={setSelectedOutsideTab}
                                    outsideControl={outsideControl}
                                    setOutsideControl={setOutsideControl}
                                />
                            }
                        />

                        <Route path='swap' element={<Swap {...swapProps} />} />
                        <Route path='testpage' element={<TestPage />} />
                        <Route path='*' element={<Navigate to='/404' replace />} />
                        <Route path='/404' element={<NotFound />} />
                    </Routes>
                </main>
                {snackbarContent}
            </div>
            <div className='footer_container'>
                {currentLocation !== '/' && (
                    <PageFooter lastBlockNumber={lastBlockNumber} userIsOnline={userIsOnline} />
                )}
            </div>
            <SidebarFooter />
        </>
    );
}
