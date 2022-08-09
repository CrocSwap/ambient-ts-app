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
    sortBaseQuoteTokens,
    toDisplayPrice,
    tickToPrice,
    CrocEnv,
    toDisplayQty,
} from '@crocswap-libs/sdk';

import {
    // receiptData,
    resetReceiptData,
} from '../utils/state/receiptDataSlice';

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
import { TokenIF, TokenListIF, PositionIF } from '../utils/interfaces/exports';
import { fetchTokenLists } from './functions/fetchTokenLists';
import {
    resetTokens,
    resetTradeData,
    setAdvancedHighTick,
    setAdvancedLowTick,
    setDenomInBase,
} from '../utils/state/tradeDataSlice';
// import PositionDetails from '../pages/Trade/Range/PositionDetails';
import { memoizeQuerySpotPrice, querySpotPrice } from './functions/querySpotPrice';
import { memoizeFetchAddress } from './functions/fetchAddress';
import { memoizeTokenBalance } from './functions/fetchTokenBalances';
import truncateDecimals from '../utils/data/truncateDecimals';
import { getNFTs } from './functions/getNFTs';
import { memoizeTokenDecimals } from './functions/queryTokenDecimals';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { useSlippage } from './useSlippage';
import { addNativeBalance, resetTokenData, setTokens } from '../utils/state/tokenDataSlice';
import { checkIsStable } from '../utils/data/stablePairs';
import { useTokenMap } from '../utils/hooks/useTokenMap';

import Reposition from '../pages/Trade/Reposition/Reposition';
import SidebarFooter from '../components/Global/SIdebarFooter/SidebarFooter';
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
    const {
        Moralis,
        chainId: moralisChainId,
        isWeb3Enabled,
        account,
        logout,
        isAuthenticated,
        isInitialized,
    } = useMoralis();

    const tokenMap = useTokenMap();

    const { switchNetwork } = useChain();

    const location = useLocation();

    const [fallbackChainId, setFallbackChainId] = useState('0x5');
    const [switchTabToTransactions, setSwitchTabToTransactions] = useState<boolean>(false);

    const [isShowAllEnabled, setIsShowAllEnabled] = useState<boolean>(true);
    const [currentTxActiveInTransactions, setCurrentTxActiveInTransactions] = useState<string>('');

    const [expandTradeTable, setExpandTradeTable] = useState(false);

    const chainId = moralisChainId ? moralisChainId : fallbackChainId;

    const poolIndex = useMemo(() => lookupChain(chainId).poolIndex.toString(), [chainId]);

    useEffect(() => {
        if (isWeb3Enabled) {
            const newNetworkHex = '0x' + parseInt(window.ethereum?.networkVersion).toString(16);
            console.log('switching networks because metamask network changed');
            switchNetwork(newNetworkHex);
        }
    }, [window.ethereum?.networkVersion]);

    const [provider, setProvider] = useState<ethers.providers.Provider>();

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
            const onChain = exposeProviderChain(provider) === parseInt(chainId);

            if (isAuthenticated) {
                if (provider && url === 'metamask' && !metamaskLocked && onChain) {
                    return;
                } else if (provider && url === 'metamask' && metamaskLocked) {
                    clickLogout();
                } else if (window.ethereum && !metamaskLocked) {
                    const metamaskProvider = new ethers.providers.Web3Provider(window.ethereum);
                    console.log('Metamask Provider');
                    setProvider(metamaskProvider);
                }
            } else if (!provider || !onChain) {
                const url = lookupChain(chainId).nodeUrl;
                setProvider(new ethers.providers.JsonRpcProvider(url));
            }
        } catch (error) {
            console.log(error);
        }
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
                    const ensName = await cachedFetchAddress(provider, account, chainId);
                    if (ensName) setEnsName(ensName);
                    else setEnsName('');
                } catch (error) {
                    setEnsName('');
                }
            }
        })();
    }, [account, chainId]);

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
                                poolIdx: poolIndex,
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
                                poolIdx: poolIndex,
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
    }, [tokenPairStringified, chainId]);

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
                                poolIdx: poolIndex,
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
                                                    poolIdx: parseInt(poolIndex),
                                                    network: chainId,
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
                poolIdx: poolIndex,
                chainId: chainId,
            }),
        [baseTokenAddress, quoteTokenAddress, chainId],
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
                poolIdx: poolIndex,
                // 	positive integer	The duration of the candle, in seconds. Must represent one of the following time intervals: 5 minutes, 15 minutes, 1 hour, 4 hours, 1 day, 7 days.
                period: activePeriod.toString(),
                // period: '60',
                chainId: chainId,
            }),
        [baseTokenAddress, quoteTokenAddress, poolIndex, activePeriod],
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
                                poolIdx: parseInt(poolIndex),
                                network: chainId,
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
                poolIdx: parseInt(poolIndex).toString(),
                // 	positive integer	The duration of the candle, in seconds. Must represent one of the following time intervals: 5 minutes, 15 minutes, 1 hour, 4 hours, 1 day, 7 days.
                period: activePeriod.toString(),
                chainId: '0x1',
                dex: 'all',
            }),
        [
            baseTokenAddress,
            quoteTokenAddress,
            parseInt(poolIndex).toString(),
            activePeriod,
            chainId,
        ],
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
                poolIdx: poolIndex,
                chainId: chainId,
            }),
        [baseTokenAddress, quoteTokenAddress, chainId],
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
                chainId: chainId,
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
    const [poolPriceNonDisplay, setPoolPriceNonDisplay] = useState(0);
    const [poolPriceDisplay, setPoolPriceDisplay] = useState(0);

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
                    : (await new CrocEnv(chainId).context).provider;

                const spotPrice = await querySpotPrice(
                    viewProvider,
                    baseTokenAddress,
                    quoteTokenAddress,
                    chainId,
                    lastBlockNumber,
                );

                // const spotPrice = await cachedQuerySpotPrice(
                //     viewProvider,
                //     baseTokenAddress,
                //     quoteTokenAddress,
                //     chainId,
                //     lastBlockNumber,
                // );
                // console.log({ spotPrice });

                setPoolPriceNonDisplay(spotPrice);
                if (spotPrice) {
                    const displayPrice = toDisplayPrice(
                        spotPrice,
                        baseTokenDecimals,
                        quoteTokenDecimals,
                    );
                    setPoolPriceDisplay(displayPrice);
                }
            })();
        }
    }, [
        lastBlockNumber,
        baseTokenAddress,
        quoteTokenAddress,
        baseTokenDecimals,
        quoteTokenDecimals,
        chainId,
        provider,
    ]);

    // useEffect to update selected token balances
    useEffect(() => {
        (async () => {
            if (provider && account && isAuthenticated && isWeb3Enabled) {
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
        chainId,
        account,
        isWeb3Enabled,
        isAuthenticated,
        JSON.stringify(tokenPair),
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
            try {
                const tokenAAddress = tokenPair.dataTokenA.address;
                if (provider && isWeb3Enabled && account !== null) {
                    const crocEnv = new CrocEnv(provider);
                    if (!tokenAAddress) {
                        return;
                    }
                    const allowance = await crocEnv.token(tokenAAddress).allowance(account);
                    setTokenAAllowance(allowance.toString());
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
        provider,
        isWeb3Enabled,
        recheckTokenAApproval,
    ]);

    // useEffect to check if user has approved CrocSwap to sell the token B
    useEffect(() => {
        (async () => {
            try {
                const tokenBAddress = tokenPair.dataTokenB.address;
                if (provider && isWeb3Enabled && account !== null) {
                    const crocEnv = new CrocEnv(provider);
                    if (!tokenBAddress) {
                        return;
                    }
                    const allowance = await crocEnv.token(tokenBAddress).allowance(account);
                    setTokenBAllowance(allowance.toString());
                }
            } catch (err) {
                console.log(err);
            }
            setRecheckTokenBApproval(false);
        })();
    }, [
        tokenPair.dataTokenB.address,
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

        // console.log({ baseTokenAddress });
        // console.log({ quoteTokenAddress });

        const viewProvider = provider ? provider : (await new CrocEnv(chainId).context).provider;
        // const poolPriceNonDisplay = 0;
        const poolPriceNonDisplay = await cachedQuerySpotPrice(
            viewProvider,
            baseTokenAddress,
            quoteTokenAddress,
            chainId,
            lastBlockNumber,
        );

        try {
            const ensName = await cachedFetchAddress(viewProvider, position.user, chainId);
            if (ensName) {
                position.userEnsName = ensName;
            }
        } catch (error) {
            console.log(error);
        }

        const poolPriceInTicks = Math.log(poolPriceNonDisplay) / Math.log(1.0001);

        const baseTokenDecimals = await cachedGetTokenDecimals(
            viewProvider,
            baseTokenAddress,
            chainId,
        );
        const quoteTokenDecimals = await cachedGetTokenDecimals(
            viewProvider,
            quoteTokenAddress,
            chainId,
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
                            chainId: parseInt(chainId),
                            logoURI: '',
                            balance: eth.toString(),
                        };
                        if (JSON.stringify(tokensInRTK[0]) !== JSON.stringify(nativeToken))
                            dispatch(addNativeBalance([nativeToken]));
                    });
                // if (
                //     provider &&
                //     provider.connection?.url === 'metamask' &&
                //     account &&
                //     isAuthenticated &&
                //     isWeb3Enabled
                // ) {
                // const signer = provider.getSigner();

                // const nativeEthBalance = await getTokenBalanceDisplay(
                //     contractAddresses.ZERO_ADDR,
                //     account,
                //     signer,
                // );
                // make sure a balance was returned, initialized as null
                // if (nativeEthBalance) {
                //     // send value to local state
                //     setNativeBalance(nativeEthBalance);
                //     const nativeToken: TokenIF = {
                //         name: 'Native Token',
                //         address: contractAddresses.ZERO_ADDR,
                //         // eslint-disable-next-line camelcase
                //         token_address: contractAddresses.ZERO_ADDR,
                //         symbol: 'ETH',
                //         decimals: 18,
                //         chainId: parseInt(chainId),
                //         logoURI: '',
                //         balance: nativeEthBalance,
                //     };
                //     // console.log('adding native balance: ' + nativeEthBalance);
                //     if (JSON.stringify(tokensInRTK[0]) !== JSON.stringify(nativeToken))
                //         dispatch(addNativeBalance([nativeToken]));
                // }
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
            const chain = chainId;
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
        isChainValid: isChainValid,
    };

    // props for <Swap/> React element
    const swapProps = {
        importedTokens: importedTokens,
        setImportedTokens: setImportedTokens,
        searchableTokens: searchableTokens,
        provider: provider,
        swapSlippage: swapSlippage,
        // provider: provider as JsonRpcProvider,
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
        chainId: chainId,
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
        // provider: provider as JsonRpcProvider,
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
        chainId: chainId,
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
        // provider: provider as JsonRpcProvider,
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
        chainId: chainId,
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
        // provider: provider as JsonRpcProvider,
        isPairStable: isPairStable,
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

    function toggleSidebar() {
        setShowSidebar(!showSidebar);
        setSidebarManuallySet(true);
    }

    function handleSetTradeTabToTransaction() {
        setSwitchTabToTransactions(!switchTabToTransactions);
    }
    // props for <Sidebar/> React element
    const sidebarProps = {
        showSidebar: showSidebar,
        toggleSidebar: toggleSidebar,
        chainId: chainId,
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
                        <Route index element={<Home tokenMap={tokenMap} />} />
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
                                    tokenMap={tokenMap}
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
                                    tokenMap={tokenMap}
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
            <SidebarFooter />
        </>
    );
}
