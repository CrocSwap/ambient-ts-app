/** ***** Import React and Dongles *******/
import { useEffect, useState, useMemo } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import {
    Position,
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
import { JsonRpcProvider } from '@ethersproject/providers';
// import { request, gql } from 'graphql-request';
import {
    useMoralis,
    //  useMoralisQuery,
    //  useMoralisSubscription,
    useChain,
} from 'react-moralis';

import useWebSocket from 'react-use-websocket';
// import { ReadyState } from 'react-use-websocket';
// import Moralis from 'moralis';
import {
    contractAddresses,
    getTokenBalanceDisplay,
    sortBaseQuoteTokens,
    getTokenDecimals,
    getTokenAllowance,
    toDisplayPrice,
    tickToPrice,
    POOL_PRIMARY,
} from '@crocswap-libs/sdk';

import { receiptData, resetReceiptData } from '../utils/state/receiptDataSlice';

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
import Chart from '../pages/Chart/Chart';
import Edit from '../pages/Trade/Edit/Edit';
import TestPage from '../pages/TestPage/TestPage';
import NotFound from '../pages/NotFound/NotFound';
import Trade from '../pages/Trade/Trade';

/** * **** Import Local Files *******/
import './App.css';
import { useAppDispatch, useAppSelector } from '../utils/hooks/reduxToolkit';
import { validateChain } from './validateChain';
// import { IParsedPosition, parsePositionArray } from './parsePositions';
import { defaultTokens } from '../utils/data/defaultTokens';
import initializeUserLocalStorage from './functions/initializeUserLocalStorage';
import { TokenIF, TokenListIF } from '../utils/interfaces/exports';
import { fetchTokenLists } from './functions/fetchTokenLists';
import {
    resetTokens,
    resetTradeData,
    setAdvancedHighTick,
    setAdvancedLowTick,
    setDenomInBase,
} from '../utils/state/tradeDataSlice';
// import PositionDetails from '../pages/Trade/Range/PositionDetails';
import { memoizePromiseFn } from './functions/memoizePromiseFn';
import { querySpotPrice } from './functions/querySpotPrice';
import { fetchAddress } from './functions/fetchAddress';
import { fetchTokenBalances } from './functions/fetchTokenBalances';
import truncateDecimals from '../utils/data/truncateDecimals';
import { getNFTs } from './functions/getNFTs';
import { useSlippage } from './useSlippage';
import { addNativeBalance, resetTokenData, setTokens } from '../utils/state/tokenDataSlice';
import { checkIsStable } from '../utils/data/stablePairs';

import Reposition from '../pages/Trade/Reposition/Reposition';
// import SidebarFooter from '../components/Global/SIdebarFooter/SidebarFooter';

const cachedQuerySpotPrice = memoizePromiseFn(querySpotPrice);
const cachedFetchAddress = memoizePromiseFn(fetchAddress);
const cachedFetchTokenBalances = memoizePromiseFn(fetchTokenBalances);
const cachedGetTokenDecimals = memoizePromiseFn(getTokenDecimals);

const httpGraphCacheServerDomain = 'https://809821320828123.de:5000';
// const httpGraphCacheServerDomain = '';
const wssGraphCacheServerDomain = 'wss://809821320828123.de:5000';
// const wssGraphCacheServerDomain = '';

const shouldSubscriptionsReconnect = false;

/** ***** React Function *******/
export default function App() {
    const {
        Moralis,
        chainId: moralisChainId,
        isWeb3Enabled,
        account,
        logout,
        isAuthenticated,
    } = useMoralis();

    const { switchNetwork } = useChain();

    const location = useLocation();

    const [fallbackChainId, setFallbackChainId] = useState('0x5');

    const chainId = moralisChainId
        ? moralisChainId
        : // : window.ethereum?.networkVersion
          // ? '0x' + parseInt(window.ethereum?.networkVersion).toString(16)
          fallbackChainId;

    useEffect(() => {
        if (isWeb3Enabled) {
            const newNetworkHex = '0x' + parseInt(window.ethereum?.networkVersion).toString(16);
            console.log('switching networks because metamask network changed');
            switchNetwork(newNetworkHex);
        }
    }, [window.ethereum?.networkVersion]);

    const [provider, setProvider] = useState<
        ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider
    >();

    const [metamaskLocked, setMetamaskLocked] = useState<boolean>(true);

    const [nativeBalance, setNativeBalance] = useState<string>('');

    useEffect(() => {
        try {
            // metamask connected and unlocked
            // if (provider && provider.connection?.url === 'metamask' && !metamaskLocked) {
            if (isAuthenticated) {
                if (
                    provider &&
                    provider.connection?.url === 'metamask' &&
                    !metamaskLocked &&
                    provider._network?.chainId === parseInt(chainId)
                ) {
                    return;
                } else if (provider && provider.connection?.url === 'metamask' && metamaskLocked) {
                    // console.log('automatically logging out');
                    clickLogout();
                    return;
                } else if (window.ethereum && !metamaskLocked) {
                    const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
                    setProvider(metamaskProvider);
                    return;
                }
            } else {
                if (provider && provider._network?.chainId === parseInt(chainId)) {
                    console.log('chainId matches');
                    return;
                }
                if (chainId === '0x2a') {
                    console.log('making new kovan speedy node provider');
                    setProvider(
                        new ethers.providers.JsonRpcProvider(
                            'https://speedy-nodes-nyc.moralis.io/015fffb61180886c9708499e/eth/kovan',
                        ),
                    );
                } else if (chainId === '0x5') {
                    console.log('making new Goerli speedy node provider');
                    setProvider(
                        new ethers.providers.JsonRpcProvider(
                            'https://speedy-nodes-nyc.moralis.io/015fffb61180886c9708499e/eth/goerli',
                        ),
                    );
                } else if (chainId === '0x1') {
                    console.log('making new Mainnet speedy node provider');
                    setProvider(
                        new ethers.providers.JsonRpcProvider(
                            'https://speedy-nodes-nyc.moralis.io/015fffb61180886c9708499e/eth/mainnet',
                        ),
                    );
                }
            }
        } catch (error) {
            console.log(error);
        }

        // const newProvider = useProvider(provider, setProvider, chainId as string);
    }, [isAuthenticated, chainId, metamaskLocked]);

    useEffect(() => {
        dispatch(resetTokens(chainId));
        dispatch(resetTokenData());
    }, [chainId]);

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

    // hook holding values and setter functions for slippage
    // holds stable and volatile values for swap and mint transactions
    const [swapSlippage, mintSlippage] = useSlippage();

    //
    const isPairStable = useMemo(
        () => checkIsStable(tradeData.tokenA.address, tradeData.tokenA.address, chainId),
        [tradeData.tokenA.address, tradeData.tokenA.address, chainId],
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

    const receiptData = useAppSelector((state) => state.receiptData) as receiptData;

    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

    const lastReceipt = receiptData?.sessionReceipts[receiptData.sessionReceipts.length - 1];

    const isLastReceiptSuccess = lastReceipt?.isTxSuccess?.toString();

    let snackMessage = '';

    if (lastReceipt) {
        if (lastReceipt.receiptType === 'swap') {
            snackMessage = `You Successfully Swapped ${lastReceipt.tokenAQtyUnscaled} ${lastReceipt.tokenASymbol} for ${lastReceipt.tokenBQtyUnscaled} ${lastReceipt.tokenBSymbol}`;
        } else if (lastReceipt.receiptType === 'mint') {
            snackMessage = `You Successfully Minted a Position with ${lastReceipt.tokenAQtyUnscaled} ${lastReceipt.tokenASymbol} and ${lastReceipt.tokenBQtyUnscaled} ${lastReceipt.tokenBSymbol}`;
        } else {
            snackMessage = 'unknown';
        }
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
                // console.log({ metamaskAccounts });
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
            if (account) {
                try {
                    const ensName = await cachedFetchAddress(account);
                    if (ensName) setEnsName(ensName);
                    else setEnsName('');
                } catch (error) {
                    setEnsName('');
                    console.log({ error });
                }
            }
        })();
    }, [account]);

    const tokensInRTK = useAppSelector((state) => state.tokenData.tokens);

    // check for token balances on each new block
    useEffect(() => {
        (async () => {
            if (account) {
                try {
                    const newTokens: TokenIF[] = await cachedFetchTokenBalances(
                        account,
                        chainId,
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
    }, [account, chainId, lastBlockNumber, tokensInRTK]);

    const [baseTokenAddress, setBaseTokenAddress] = useState<string>('');
    const [quoteTokenAddress, setQuoteTokenAddress] = useState<string>('');

    const [baseTokenDecimals, setBaseTokenDecimals] = useState<number>(0);
    const [quoteTokenDecimals, setQuoteTokenDecimals] = useState<number>(0);

    const [isTokenABase, setIsTokenABase] = useState<boolean>(true);

    const tokenPair = {
        dataTokenA: tradeData.tokenA,
        dataTokenB: tradeData.tokenB,
    };

    const tokenPairStringified = useMemo(() => JSON.stringify(tokenPair), [tokenPair]);

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
            // console.log({ sortedTokens });
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
                                poolIdx: POOL_PRIMARY.toString(),
                                chainId: chainId,
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
                                                setPositionsByPool({ positions: updatedPositions }),
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
                                poolIdx: POOL_PRIMARY.toString(),
                                chainId: chainId,
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
                                        dispatch(setSwapsByPool({ swaps: updatedSwaps }));
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
    }, [tokenPairStringified, chainId]);

    // const [activePeriod, setActivePeriod] = useState(60); // 1 minute by default
    const activePeriod = tradeData.activeChartPeriod;

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
                                poolIdx: POOL_PRIMARY.toString(),
                                period: activePeriod.toString(),
                                // period: '86400', // 1 day
                                // period: '300', // 5 minute
                                // time: '1657833300', // optional
                                n: '200', // positive integer
                                page: '0', // nonnegative integer
                                chainId: chainId,
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
                                                    poolIdx: POOL_PRIMARY,
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
    }, [baseTokenAddress, quoteTokenAddress, activePeriod, chainId]);

    const allPositionsCacheSubscriptionEndpoint = useMemo(
        () =>
            wssGraphCacheServerDomain +
            '/subscribe_pool_positions?' +
            new URLSearchParams({
                base: baseTokenAddress.toLowerCase(),
                // baseTokenAddress.toLowerCase() || '0x0000000000000000000000000000000000000000',
                quote: quoteTokenAddress.toLowerCase(),
                // quoteTokenAddress.toLowerCase() || '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
                poolIdx: POOL_PRIMARY.toString(),
                chainId: chainId,
            }),
        [baseTokenAddress, quoteTokenAddress, POOL_PRIMARY, chainId],
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
            onClose: (event) => console.log({ event }),
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
                poolIdx: POOL_PRIMARY.toString(),
                // 	positive integer	The duration of the candle, in seconds. Must represent one of the following time intervals: 5 minutes, 15 minutes, 1 hour, 4 hours, 1 day, 7 days.
                period: activePeriod.toString(),
                // period: '60',
                chainId: chainId,
            }),
        [baseTokenAddress, quoteTokenAddress, POOL_PRIMARY, activePeriod],
    );

    const {
        //  sendMessage,
        lastMessage: candlesMessage,
        //  readyState
    } = useWebSocket(
        candleSubscriptionEndpoint,
        {
            // share:  true,
            // onOpen: () => console.log('opened'),
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
                Promise.all(lastMessageData.map(getCandleData)).then((updatedCandles) => {
                    // console.log({ updatedCandles });
                    dispatch(
                        addCandles({
                            pool: {
                                baseAddress: baseTokenAddress,
                                quoteAddress: quoteTokenAddress,
                                poolIdx: POOL_PRIMARY,
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

    const poolSwapsCacheSubscriptionEndpoint = useMemo(
        () =>
            wssGraphCacheServerDomain +
            '/subscribe_pool_swaps?' +
            new URLSearchParams({
                base: baseTokenAddress.toLowerCase(),
                // baseTokenAddress.toLowerCase() || '0x0000000000000000000000000000000000000000',
                quote: quoteTokenAddress.toLowerCase(),
                // quoteTokenAddress.toLowerCase() || '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
                poolIdx: POOL_PRIMARY.toString(),
                chainId: chainId,
            }),
        [baseTokenAddress, quoteTokenAddress, POOL_PRIMARY, chainId],
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
            onClose: (event) => console.log({ event }),
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
                chainId: chainId,
                // user: account || '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            }),
        [account, chainId],
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
            onClose: (event) => console.log({ event }),
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
                chainId: chainId,
                // user: account || '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            }),
        [account, chainId],
    );

    const {
        //  sendMessage,
        lastMessage: lastUserSwapsMessage,
        //  readyState
    } = useWebSocket(
        userSwapsCacheSubscriptionEndpoint,
        {
            // share: true,
            // onOpen: () => console.log('opened'),
            onClose: (event) => console.log({ event }),
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
                            swaps: updatedSwaps.concat(graphData.swapsByUser.swaps),
                        }),
                    );
                });
            }
        }
    }, [lastUserSwapsMessage]);

    const [tokenABalance, setTokenABalance] = useState<string>('');
    const [tokenBBalance, setTokenBBalance] = useState<string>('');
    const [poolPriceNonDisplay, setPoolPriceNonDisplay] = useState(0);
    const [poolPriceDisplay, setPoolPriceDisplay] = useState(0);

    // useEffect to get spot price when tokens change and block updates
    useEffect(() => {
        if (baseTokenAddress && quoteTokenAddress) {
            (async () => {
                try {
                    const spotPrice = await cachedQuerySpotPrice(
                        baseTokenAddress,
                        quoteTokenAddress,
                        chainId,
                        lastBlockNumber,
                    );
                    if (poolPriceNonDisplay !== spotPrice) {
                        // console.log({ spotPrice });
                        setPoolPriceNonDisplay(spotPrice);
                        const displayPrice = toDisplayPrice(
                            spotPrice,
                            baseTokenDecimals,
                            quoteTokenDecimals,
                        );
                        // console.log({ displayPrice });
                        setPoolPriceDisplay(displayPrice);
                    }
                } catch (error) {
                    console.log({ error });
                }
            })();
        }
    }, [lastBlockNumber, baseTokenAddress, quoteTokenAddress, chainId]);

    // useEffect to update selected token balances
    useEffect(() => {
        (async () => {
            if (
                provider &&
                account &&
                isAuthenticated &&
                isWeb3Enabled
                // && provider.connection?.url === 'metamask'
            ) {
                try {
                    const signer = provider.getSigner();
                    const tokenABal = await getTokenBalanceDisplay(
                        tokenPair.dataTokenA.address,
                        account,
                        signer,
                    );
                    // make sure a balance was returned, initialized as null
                    if (tokenABal) {
                        // send value to local state
                        setTokenABalance(tokenABal);
                    }
                    const tokenBBal = await getTokenBalanceDisplay(
                        tokenPair.dataTokenB.address,
                        account,
                        signer,
                    );
                    // make sure a balance was returned, initialized as null
                    if (tokenBBal) {
                        // send value to local state
                        setTokenBBalance(tokenBBal);
                    }
                } catch (error) {
                    console.log({ error });
                }
            }
        })();
    }, [
        chainId,
        account,
        isWeb3Enabled,
        isAuthenticated,
        JSON.stringify(tokenPair),
        lastBlockNumber,
    ]);

    const [tokenAAllowance, setTokenAAllowance] = useState<string>('');
    const [tokenBAllowance, setTokenBAllowance] = useState<string>('');

    const [recheckTokenAApproval, setRecheckTokenAApproval] = useState<boolean>(false);
    const [recheckTokenBApproval, setRecheckTokenBApproval] = useState<boolean>(false);

    // useEffect to check if user has approved CrocSwap to sell the token A
    // (hardcoded for native Ether)
    useEffect(() => {
        (async () => {
            try {
                const tokenAAddress = tokenPair.dataTokenA.address;
                if (isWeb3Enabled && account !== null) {
                    if (!tokenAAddress) {
                        return;
                    }
                    if (tokenAAddress === contractAddresses.ZERO_ADDR) {
                        setTokenAAllowance((Number.MAX_SAFE_INTEGER - 1).toString());
                        return;
                    }
                    if (provider) {
                        const signer = provider.getSigner();
                        getTokenAllowance(tokenAAddress, account, signer)
                            .then(function (result) {
                                const allowance = result.lt(Number.MAX_SAFE_INTEGER - 1)
                                    ? result.toNumber()
                                    : Number.MAX_SAFE_INTEGER - 1;
                                setTokenAAllowance(allowance.toString());
                            })
                            .catch((e) => {
                                console.log(e);
                            });
                    }
                }
            } catch (err) {
                console.log(err);
            }
            setRecheckTokenAApproval(false);
        })();
    }, [
        tokenPair.dataTokenA.address,
        lastBlockNumber,
        account,
        chainId,
        isWeb3Enabled,
        recheckTokenAApproval,
    ]);

    // useEffect to check if user has approved CrocSwap to sell token B
    // (hardcoded for native Ether)
    useEffect(() => {
        (async () => {
            try {
                const tokenBAddress = tokenPair.dataTokenB.address;
                if (isWeb3Enabled && account !== null) {
                    if (!tokenBAddress) {
                        return;
                    }
                    if (tokenBAddress === contractAddresses.ZERO_ADDR) {
                        setTokenBAllowance((Number.MAX_SAFE_INTEGER - 1).toString());
                        return;
                    }
                    if (provider) {
                        const signer = provider.getSigner();
                        getTokenAllowance(tokenBAddress, account, signer)
                            .then(function (result) {
                                // console.log({ result });
                                const allowance = result.lt(Number.MAX_SAFE_INTEGER - 1)
                                    ? result.toNumber()
                                    : Number.MAX_SAFE_INTEGER - 1;
                                setTokenBAllowance(allowance.toString());
                            })
                            .catch((e) => {
                                console.log(e);
                            });
                    }
                }
            } catch (err) {
                console.log(err);
            }
        })();
    }, [
        tokenPair.dataTokenB.address,
        account,
        chainId,
        isWeb3Enabled,
        recheckTokenBApproval,
        lastBlockNumber,
    ]);

    const graphData = useAppSelector((state) => state.graphData);

    const getSwapData = async (swap: ISwap): Promise<ISwap> => {
        swap.base = swap.base.startsWith('0x') ? swap.base : '0x' + swap.base;
        swap.quote = swap.quote.startsWith('0x') ? swap.quote : '0x' + swap.quote;
        swap.user = swap.user.startsWith('0x') ? swap.user : '0x' + swap.user;
        swap.id = '0x' + swap.id.slice(5);

        return swap;
    };

    const getCandleData = async (candle: CandleData): Promise<CandleData> => {
        if (candle) {
            candle.base = candle.base?.startsWith('0x') ? candle.base : '0x' + candle.base;
            candle.quote = candle.quote?.startsWith('0x') ? candle.quote : '0x' + candle.quote;
        }
        return candle;
    };

    const getPositionData = async (position: Position): Promise<Position> => {
        position.base = position.base.startsWith('0x') ? position.base : '0x' + position.base;
        position.quote = position.quote.startsWith('0x') ? position.quote : '0x' + position.quote;
        position.user = position.user.startsWith('0x') ? position.user : '0x' + position.user;

        const baseTokenAddress = position.base;
        const quoteTokenAddress = position.quote;

        const poolPriceNonDisplay = await cachedQuerySpotPrice(
            baseTokenAddress,
            quoteTokenAddress,
            chainId,
            lastBlockNumber,
        );

        try {
            position.userEnsName = await cachedFetchAddress(position.user);
        } catch (error) {
            console.log(error);
        }

        const poolPriceInTicks = Math.log(poolPriceNonDisplay) / Math.log(1.0001);

        const baseTokenDecimals = await cachedGetTokenDecimals(baseTokenAddress);
        const quoteTokenDecimals = await cachedGetTokenDecimals(quoteTokenAddress);

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
                lowerPriceDisplayInBase < 2
                    ? truncateDecimals(lowerPriceDisplayInBase, 4).toString()
                    : truncateDecimals(lowerPriceDisplayInBase, 2).toString();
            position.highRangeDisplayInBase =
                upperPriceDisplayInBase < 2
                    ? truncateDecimals(upperPriceDisplayInBase, 4).toString()
                    : truncateDecimals(upperPriceDisplayInBase, 2).toString();
        }

        if (!position.ambient) {
            position.lowRangeDisplayInQuote =
                lowerPriceDisplayInQuote < 2
                    ? truncateDecimals(lowerPriceDisplayInQuote, 4).toString()
                    : truncateDecimals(lowerPriceDisplayInQuote, 2).toString();
            position.highRangeDisplayInQuote =
                upperPriceDisplayInQuote < 2
                    ? truncateDecimals(upperPriceDisplayInQuote, 4).toString()
                    : truncateDecimals(upperPriceDisplayInQuote, 2).toString();
        }

        position.poolPriceInTicks = poolPriceInTicks;

        if (baseTokenAddress === contractAddresses.ZERO_ADDR) {
            position.baseTokenSymbol = 'ETH';
            position.quoteTokenSymbol = 'DAI';
            position.tokenAQtyDisplay = '1';
            position.tokenBQtyDisplay = '2000';
            // if (!position.ambient) {
            //     position.lowRangeDisplay = '.001';
            //     position.highRangeDisplay = '.002';
            // }
        } else if (
            baseTokenAddress.toLowerCase() ===
            '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa'.toLowerCase()
        ) {
            position.baseTokenSymbol = 'DAI';
            position.quoteTokenSymbol = 'USDC';
            position.tokenAQtyDisplay = '101';
            position.tokenBQtyDisplay = '100';
            // if (!position.ambient) {
            //     position.lowRangeDisplay = '0.9';
            //     position.highRangeDisplay = '1.1';
            // }
        } else {
            position.baseTokenSymbol = 'unknownBase';
            position.quoteTokenSymbol = 'unknownQuote';
        }
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
                            chainId: chainId,
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
                                            setPositionsByUser({ positions: updatedPositions }),
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
                            chainId: chainId,
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
                                    dispatch(setSwapsByUser({ swaps: updatedSwaps }));
                                }
                            });
                        }
                    })
                    .catch(console.log);
            } catch (error) {
                console.log;
            }
        }
    }, [isAuthenticated, account, chainId]);

    // run function to initialize local storage
    // internal controls will only initialize values that don't exist
    // existing values will not be overwritten

    // determine whether the user is connected to a supported chain
    // the user being connected to a non-supported chain or not being
    // ... connected at all are both reflected as `false`
    // later we can make this available to the rest of the app through
    // ... the React Router context provider API
    const isChainValid = chainId ? validateChain(chainId as string) : false;
    console.assert(true, isChainValid);

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

    // function to sever connection between user wallet and Moralis server
    const clickLogout = async () => {
        setNativeBalance('');
        setTokenABalance('0');
        setTokenBBalance('0');
        dispatch(resetTradeData());
        dispatch(resetTokenData());
        dispatch(resetGraphData());
        dispatch(resetReceiptData());

        await logout();
    };

    // TODO: this may work better as a useMemo... play with it a bit
    // this is how we run the function to pull back balances asynchronously
    useEffect(() => {
        (async () => {
            if (
                provider &&
                provider.connection?.url === 'metamask' &&
                account &&
                isAuthenticated &&
                isWeb3Enabled
            ) {
                const signer = provider.getSigner();
                const nativeEthBalance = await getTokenBalanceDisplay(
                    contractAddresses.ZERO_ADDR,
                    account,
                    signer,
                );
                // console.log({ nativeEthBalance });
                // make sure a balance was returned, initialized as null
                if (nativeEthBalance) {
                    // send value to local state
                    setNativeBalance(nativeEthBalance);
                    const nativeToken: TokenIF = {
                        name: 'Native Token',
                        address: contractAddresses.ZERO_ADDR,
                        // eslint-disable-next-line camelcase
                        token_address: contractAddresses.ZERO_ADDR,
                        symbol: 'ETH',
                        decimals: 18,
                        chainId: parseInt(chainId),
                        logoURI: '',
                        balance: nativeEthBalance,
                    };
                    // console.log('adding native balance: ' + nativeEthBalance);
                    if (JSON.stringify(tokensInRTK[0]) !== JSON.stringify(nativeToken))
                        dispatch(addNativeBalance([nativeToken]));
                }
            }
        })();
    }, [provider, account, isWeb3Enabled, isAuthenticated, lastBlockNumber]);

    const [gasPriceinGwei, setGasPriceinGwei] = useState<string>('');

    useEffect(() => {
        fetch(
            'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=KNJM7A9ST1Q1EESYXPPQITIP7I8EFSY456',
            // 'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=3UGY5173DQXPSPSVAUNZIVXVN4XI3YEE2N',
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
            const chain = chainId;
            // console.log({ chainId });
            const options: { chain: '0x2a' | '0x5' | 'kovan'; date: string } = {
                chain: chain as '0x2a' | '0x5' | 'kovan',
                date: currentDateTime,
            };
            const currentBlock = (await Moralis.Web3API.native.getDateToBlock(options)).block;
            if (currentBlock !== lastBlockNumber) {
                setLastBlockNumber(currentBlock);
            }
        }, 10000);

        return () => clearInterval(interval);
        // }
    }, [chainId, lastBlockNumber]);

    const shouldDisplayAccountTab = isAuthenticated && isWeb3Enabled && account != '';

    // props for <PageHeader/> React element
    const headerProps = {
        nativeBalance: nativeBalance,
        clickLogout: clickLogout,
        metamaskLocked: metamaskLocked,
        ensName: ensName,
        shouldDisplayAccountTab: shouldDisplayAccountTab,
        chainId: chainId,
        setFallbackChainId: setFallbackChainId,
    };

    // props for <Swap/> React element
    const swapProps = {
        importedTokens: importedTokens,
        setImportedTokens: setImportedTokens,
        searchableTokens: searchableTokens,
        swapSlippage: swapSlippage,
        isPairStable: isPairStable,
        provider: provider as JsonRpcProvider,
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
        chainId: chainId,
        activeTokenListsChanged: activeTokenListsChanged,
        indicateActiveTokenListsChanged: indicateActiveTokenListsChanged,
    };

    // props for <Swap/> React element on trade route
    const swapPropsTrade = {
        importedTokens: importedTokens,
        setImportedTokens: setImportedTokens,
        searchableTokens: searchableTokens,
        swapSlippage: swapSlippage,
        isPairStable: isPairStable,
        provider: provider as JsonRpcProvider,
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
        chainId: chainId,
        activeTokenListsChanged: activeTokenListsChanged,
        indicateActiveTokenListsChanged: indicateActiveTokenListsChanged,
    };

    // props for <Limit/> React element on trade route
    const limitPropsTrade = {
        importedTokens: importedTokens,
        setImportedTokens: setImportedTokens,
        searchableTokens: searchableTokens,
        mintSlippage: mintSlippage,
        isPairStable: isPairStable,
        provider: provider as JsonRpcProvider,
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
        chainId: chainId,
        activeTokenListsChanged: activeTokenListsChanged,
        indicateActiveTokenListsChanged: indicateActiveTokenListsChanged,
    };

    // props for <Range/> React element
    const rangeProps = {
        importedTokens: importedTokens,
        setImportedTokens: setImportedTokens,
        searchableTokens: searchableTokens,
        mintSlippage: mintSlippage,
        isPairStable: isPairStable,
        provider: provider as JsonRpcProvider,
        lastBlockNumber: lastBlockNumber,
        gasPriceinGwei: gasPriceinGwei,
        baseTokenAddress: baseTokenAddress,
        quoteTokenAddress: quoteTokenAddress,
        poolPriceNonDisplay: poolPriceNonDisplay,
        poolPriceDisplay: poolPriceDisplay.toString(),
        tokenABalance: tokenABalance,
        tokenAAllowance: tokenAAllowance,
        setRecheckTokenAApproval: setRecheckTokenAApproval,
        tokenBBalance: tokenBBalance,
        tokenBAllowance: tokenBAllowance,
        setRecheckTokenBApproval: setRecheckTokenBApproval,
        chainId: chainId,
        activeTokenListsChanged: activeTokenListsChanged,
        indicateActiveTokenListsChanged: indicateActiveTokenListsChanged,
    };

    // props for <Sidebar/> React element
    function toggleSidebar() {
        setShowSidebar(!showSidebar);
        setSidebarManuallySet(true);
    }
    const sidebarProps = {
        showSidebar: showSidebar,
        toggleSidebar: toggleSidebar,
        chainId: chainId,
        // setShowSidebar : setShowSidebar
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
            poolPriceDisplay < 1
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

    return (
        <>
            <div className='content-container'>
                {currentLocation !== '/404' && <PageHeader {...headerProps} />}
                <main className={`${showSidebarOrNullStyle} ${swapBodyStyle}`}>
                    {sidebarRender}
                    {/* <div className={`${noSidebarStyle} ${swapBodyStyle}`}> */}

                    <Routes>
                        <Route index element={<Home />} />
                        <Route
                            path='trade'
                            element={
                                <Trade
                                    account={account ?? ''}
                                    isAuthenticated={isAuthenticated}
                                    isWeb3Enabled={isWeb3Enabled}
                                    lastBlockNumber={lastBlockNumber}
                                    isTokenABase={isTokenABase}
                                    poolPriceDisplay={poolPriceDisplay}
                                    chainId={chainId}
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
                        <Route path='analytics' element={<Analytics />} />
                        {/* <Route path='details' element={<PositionDetails />} /> */}
                        <Route path='range2' element={<Range {...rangeProps} />} />

                        <Route
                            path='account'
                            element={
                                <Portfolio
                                    ensName={ensName}
                                    connectedAccount={account ? account : ''}
                                    userImageData={imageData}
                                    chainId={chainId}
                                />
                            }
                        />
                        <Route
                            path='account/:address'
                            element={
                                <Portfolio
                                    ensName={ensName}
                                    connectedAccount={account ? account : ''}
                                    chainId={chainId}
                                    userImageData={imageData}
                                />
                            }
                        />

                        <Route path='swap' element={<Swap {...swapProps} />} />
                        <Route path='chart' element={<Chart />} />
                        <Route path='testpage' element={<TestPage />} />
                        <Route path='*' element={<Navigate to='/404' replace />} />
                        <Route path='/404' element={<NotFound />} />
                    </Routes>
                </main>
                {snackbarContent}
            </div>
            <div className='footer_container'>
                <PageFooter lastBlockNumber={lastBlockNumber} />
            </div>
            {/* <SidebarFooter/> */}
        </>
    );
}
