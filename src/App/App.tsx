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
    addSwapsByUser,
    addSwapsByPool,
    CandleData,
    setCandles,
    addCandles,
    setLiquidity,
    setPoolVolumeSeries,
    setPoolTvlSeries,
    addPositionsByUser,
    addPositionsByPool,
    setLimitOrdersByUser,
} from '../utils/state/graphDataSlice';
import { ethers } from 'ethers';
import { useMoralis } from 'react-moralis';
import useWebSocket from 'react-use-websocket';
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
import WalletModal from './components/WalletModal/WalletModal';
import Home from '../pages/Home/Home';
import Analytics from '../pages/Analytics/Analytics';
import Portfolio from '../pages/Portfolio/Portfolio';
import Limit from '../pages/Trade/Limit/Limit';
import Range from '../pages/Trade/Range/Range';
import Swap from '../pages/Swap/Swap';
import Edit from '../pages/Trade/Edit/Edit';
import TermsOfService from '../pages/TermsOfService/TermsOfService';
import TestPage from '../pages/TestPage/TestPage';
import NotFound from '../pages/NotFound/NotFound';
import Trade from '../pages/Trade/Trade';
import Reposition from '../pages/Trade/Reposition/Reposition';
import SidebarFooter from '../components/Global/SIdebarFooter/SidebarFooter';

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
    setAdvancedMode,
    setDenomInBase,
    setDidUserFlipDenom,
    setPrimaryQuantityRange,
    setSimpleRangeWidth,
} from '../utils/state/tradeDataSlice';
import PoolPage from '../pages/PoolPage/PoolPage';
import { memoizeQuerySpotPrice, querySpotPrice } from './functions/querySpotPrice';
import { memoizeFetchAddress } from './functions/fetchAddress';
import { memoizeTokenBalance } from './functions/fetchTokenBalances';
import { getNFTs } from './functions/getNFTs';
// import { memoizeTokenDecimals } from './functions/queryTokenDecimals';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { useSlippage } from './useSlippage';
import { useFavePools } from './hooks/useFavePools';
import { useAppChain } from './hooks/useAppChain';
import { addNativeBalance, resetTokenData, setTokens } from '../utils/state/tokenDataSlice';
import { checkIsStable } from '../utils/data/stablePairs';
import { useTokenMap } from '../utils/hooks/useTokenMap';
import { validateChain } from './validateChain';
import { testTokenMap } from '../utils/data/testTokenMap';
import { ZERO_ADDRESS } from '../constants';
import { useModal } from '../components/Global/Modal/useModal';
import { useGlobalModal } from './components/GlobalModal/useGlobalModal';

// import authenticateUser from '../utils/functions/authenticateUser';
import { getVolumeSeries } from './functions/getVolumeSeries';
import { getTvlSeries } from './functions/getTvlSeries';
import Chat from './components/Chat/Chat';
import { formatAmount } from '../utils/numbers';
import GlobalModal from './components/GlobalModal/GlobalModal';

const cachedQuerySpotPrice = memoizeQuerySpotPrice();
const cachedFetchAddress = memoizeFetchAddress();
const cachedFetchTokenBalances = memoizeTokenBalance();
// const cachedGetTokenDecimals = memoizeTokenDecimals();

const httpGraphCacheServerDomain = 'https://809821320828123.de:5000';
const wssGraphCacheServerDomain = 'wss://809821320828123.de:5000';

const shouldCandleSubscriptionsReconnect = true;
const shouldNonCandleSubscriptionsReconnect = true;

/** ***** React Function *******/
export default function App() {
    const {
        // Moralis,
        isWeb3Enabled,
        account,
        logout,
        isAuthenticated,
        isAuthenticating,
        // isInitialized,
        authenticate,
        enableWeb3,
        // authError
    } = useMoralis();

    const tokenMap = useTokenMap();

    const location = useLocation();

    // custom hook to manage chain the app is using
    // `chainData` is data on the current chain retrieved from our SDK
    // `isChainSupported` is a boolean indicating whether the chain is supported by Ambient
    // `switchChain` is a function to switch to a different chain
    // `'0x5'` is the chain the app should be on by default
    const [chainData, isChainSupported, switchChain, switchNetworkInMoralis] = useAppChain('0x5');
    useEffect(() => console.warn(chainData.chainId), [chainData.chainId]);

    const [isShowAllEnabled, setIsShowAllEnabled] = useState(true);
    const [currentTxActiveInTransactions, setCurrentTxActiveInTransactions] = useState('');
    const [currentPositionActive, setCurrentPositionActive] = useState('');
    const [expandTradeTable, setExpandTradeTable] = useState(false);
    const [userIsOnline, setUserIsOnline] = useState(navigator.onLine);

    window.ononline = () => setUserIsOnline(true);
    window.onoffline = () => setUserIsOnline(false);

    const [provider, setProvider] = useState<ethers.providers.Provider>();
    const [crocEnv, setCrocEnv] = useState<CrocEnv | undefined>();

    useEffect(() => {
        (async () => {
            if (!provider) {
                return;
            } else {
                setCrocEnv(new CrocEnv(provider));
            }
        })();
    }, [provider]);

    function exposeProviderUrl(provider?: ethers.providers.Provider): string {
        if (provider && 'connection' in provider) {
            return (provider as ethers.providers.WebSocketProvider).connection?.url;
        } else {
            return '';
        }
    }

    function exposeProviderChain(provider?: ethers.providers.Provider): number {
        if (provider && 'network' in provider) {
            return (provider as ethers.providers.WebSocketProvider).network?.chainId;
        } else {
            return -1;
        }
    }

    const [metamaskLocked, setMetamaskLocked] = useState<boolean>(true);
    useEffect(() => {
        try {
            console.log('Init provider' + provider);
            const url = exposeProviderUrl(provider);
            const onChain = exposeProviderChain(provider) === parseInt(chainData.chainId);

            console.log('Exposed URL ' + url);

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
                const chainSpec = lookupChain(chainData.chainId);
                const url = chainSpec.wsUrl ? chainSpec.wsUrl : chainSpec.nodeUrl;
                console.log('Chain URL ' + url);
                setProvider(new ethers.providers.WebSocketProvider(url));
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
        fetch('https://goerli.infura.io/v3/4a162c75bd514925890174ca13cdb6a2', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_blockNumber',
                params: [],
                id: 5,
            }),
        })
            .then((response) => response?.json())
            .then((json) => {
                if (lastBlockNumber !== parseInt(json?.result)) {
                    setLastBlockNumber(parseInt(json?.result));
                }
            });
    }, []);

    const goerliWssInfuraEndpoint = 'wss://goerli.infura.io/ws/v3/4a162c75bd514925890174ca13cdb6a2';

    const { sendMessage: send, lastMessage: lastNewHeadMessage } = useWebSocket(
        goerliWssInfuraEndpoint,
        {
            onOpen: () => {
                console.log('infura newHeads subscription opened');
                send('{"jsonrpc":"2.0","method":"eth_subscribe","params":["newHeads"],"id":5}');
            },
            onClose: (event: CloseEvent) => {
                console.log('infura newHeads subscription closed');
                console.log({ event });
            },
            shouldReconnect: () => shouldNonCandleSubscriptionsReconnect,
        },
    );

    useEffect(() => {
        if (lastNewHeadMessage !== null) {
            if (lastNewHeadMessage?.data) {
                const lastMessageData = JSON.parse(lastNewHeadMessage?.data);
                if (lastMessageData) {
                    const lastBlockNumberHex = lastMessageData.params?.result?.number;
                    if (lastBlockNumberHex && lastBlockNumber !== parseInt(lastBlockNumberHex)) {
                        setLastBlockNumber(parseInt(lastBlockNumberHex));
                    }
                }
            }
        }
    }, [lastNewHeadMessage]);

    // hook holding values and setter functions for slippage
    // holds stable and volatile values for swap and mint transactions
    const [swapSlippage, mintSlippage] = useSlippage();

    const [favePools, addPoolToFaves, removePoolFromFaves] = useFavePools();

    const isPairStable = useMemo(
        () => checkIsStable(tradeData.tokenA.address, tradeData.tokenA.address, chainData.chainId),
        [tradeData.tokenA.address, tradeData.tokenA.address, chainData.chainId],
    );

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
                  .flatMap((tokenList: TokenListIF) => tokenList.tokens)
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

    const [mainnetBaseTokenAddress, setMainnetBaseTokenAddress] = useState<string>('');
    const [mainnetQuoteTokenAddress, setMainnetQuoteTokenAddress] = useState<string>('');

    const [baseTokenDecimals, setBaseTokenDecimals] = useState<number>(0);
    const [quoteTokenDecimals, setQuoteTokenDecimals] = useState<number>(0);

    const [isTokenABase, setIsTokenABase] = useState<boolean>(true);

    const [ambientApy, setAmbientApy] = useState<number | undefined>();

    // TODO:  @Emily useMemo() this value
    const tokenPair = {
        dataTokenA: tradeData.tokenA,
        dataTokenB: tradeData.tokenB,
    };

    const tokenPairStringified = useMemo(() => JSON.stringify(tokenPair), [tokenPair]);

    useEffect(() => {
        dispatch(setPrimaryQuantityRange(''));
        dispatch(setSimpleRangeWidth(100));
        dispatch(setAdvancedMode(false));
        setPoolPriceDisplay(undefined);
        dispatch(setDidUserFlipDenom(false)); // reset so a new token pair is re-evaluated for price > 1
        const sliderInput = document.getElementById('input-slider-range') as HTMLInputElement;
        if (sliderInput) sliderInput.value = '100';
    }, [JSON.stringify({ base: baseTokenAddress, quote: quoteTokenAddress })]);

    useEffect(() => {
        (async () => {
            if (baseTokenAddress && quoteTokenAddress) {
                const poolAmbientApyCacheEndpoint =
                    'https://809821320828123.de:5000' + '/pool_ambient_apy_cached?';

                fetch(
                    poolAmbientApyCacheEndpoint +
                        new URLSearchParams({
                            base: baseTokenAddress.toLowerCase(),
                            quote: quoteTokenAddress.toLowerCase(),
                            poolIdx: chainData.poolIndex.toString(),
                            chainId: chainData.chainId,
                            concise: 'true',
                            lookback: '604800',
                            // n: 10 // positive integer	(Optional.) If n and page are provided, query returns a page of results with at most n entries.
                            // page: 0 // nonnegative integer	(Optional.) If n and page are provided, query returns the page-th page of results. Page numbers are 0-indexed.
                        }),
                )
                    .then((response) => response?.json())
                    .then((json) => {
                        const ambientApy = json?.data?.apy;
                        setAmbientApy(ambientApy);
                    });
            }
        })();
    }, [JSON.stringify({ base: baseTokenAddress, quote: quoteTokenAddress })]);

    // useEffect that runs when token pair changes
    useEffect(() => {
        // reset rtk values for user specified range in ticks
        dispatch(setAdvancedLowTick(0));
        dispatch(setAdvancedHighTick(0));

        const tokenAAddress = tokenPair?.dataTokenA?.address;
        const tokenBAddress = tokenPair?.dataTokenB?.address;

        if (tokenAAddress && tokenBAddress) {
            const sortedTokens = sortBaseQuoteTokens(tokenAAddress, tokenBAddress);
            const tokenAMainnetEquivalent =
                tokenAAddress === ZERO_ADDRESS
                    ? tokenAAddress
                    : testTokenMap
                          .get(tokenAAddress.toLowerCase() + '_' + chainData.chainId)
                          ?.split('_')[0];
            const tokenBMainnetEquivalent =
                tokenBAddress === ZERO_ADDRESS
                    ? tokenBAddress
                    : testTokenMap
                          .get(tokenBAddress.toLowerCase() + '_' + chainData.chainId)
                          ?.split('_')[0];

            if (tokenAMainnetEquivalent && tokenBMainnetEquivalent) {
                const sortedMainnetTokens = sortBaseQuoteTokens(
                    tokenAMainnetEquivalent,
                    tokenBMainnetEquivalent,
                );

                setMainnetBaseTokenAddress(sortedMainnetTokens[0]);
                setMainnetQuoteTokenAddress(sortedMainnetTokens[1]);
            }

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

            // retrieve pool TVL series
            getTvlSeries(
                sortedTokens[0],
                sortedTokens[1],
                chainData.poolIndex,
                chainData.chainId,
                600, // 10 minute resolution
            )
                .then((tvlSeries) => {
                    if (
                        tvlSeries &&
                        tvlSeries.base &&
                        tvlSeries.quote &&
                        tvlSeries.poolIdx &&
                        tvlSeries.seriesData
                    )
                        dispatch(
                            setPoolTvlSeries({
                                dataReceived: true,
                                pools: [
                                    {
                                        dataReceived: true,
                                        pool: {
                                            base: tvlSeries.base,
                                            quote: tvlSeries.quote,
                                            poolIdx: tvlSeries.poolIdx,
                                            chainId: chainData.chainId,
                                        },
                                        tvlData: tvlSeries,
                                    },
                                ],
                            }),
                        );
                })
                .catch(console.log);

            // retrieve pool volume series
            getVolumeSeries(
                sortedTokens[0],
                sortedTokens[1],
                chainData.poolIndex,
                chainData.chainId,
                600, // 10 minute resolution
            )
                .then((volumeSeries) => {
                    if (
                        volumeSeries &&
                        volumeSeries.base &&
                        volumeSeries.quote &&
                        volumeSeries.poolIdx &&
                        volumeSeries.seriesData
                    )
                        dispatch(
                            setPoolVolumeSeries({
                                dataReceived: true,
                                pools: [
                                    {
                                        dataReceived: true,
                                        pool: {
                                            base: volumeSeries.base,
                                            quote: volumeSeries.quote,
                                            poolIdx: volumeSeries.poolIdx,
                                            chainId: chainData.chainId,
                                        },
                                        volumeData: volumeSeries,
                                    },
                                ],
                            }),
                        );
                })
                .catch(console.log);

            // retrieve pool liquidity
            try {
                if (httpGraphCacheServerDomain) {
                    console.log('fetching pool liquidity distribution');

                    const poolLiquidityCacheEndpoint =
                        httpGraphCacheServerDomain + '/pool_liquidity_distribution?';

                    fetch(
                        poolLiquidityCacheEndpoint +
                            new URLSearchParams({
                                base: sortedTokens[0].toLowerCase(),
                                quote: sortedTokens[1].toLowerCase(),
                                poolIdx: chainData.poolIndex.toString(),
                                chainId: chainData.chainId,
                                concise: 'true',
                                // n: 10 // positive integer	(Optional.) If n and page are provided, query returns a page of results with at most n entries.
                                // page: 0 // nonnegative integer	(Optional.) If n and page are provided, query returns the page-th page of results. Page numbers are 0-indexed.
                            }),
                    )
                        .then((response) => response?.json())
                        .then((json) => {
                            const poolLiquidity = json?.data;

                            if (poolLiquidity) {
                                dispatch(
                                    setLiquidity({
                                        pool: {
                                            baseAddress: sortedTokens[0].toLowerCase(),
                                            quoteAddress: sortedTokens[1].toLowerCase(),
                                            poolIdx: chainData.poolIndex,
                                            chainId: chainData.chainId,
                                        },
                                        liquidityData: poolLiquidity,
                                    }),
                                );
                            }
                        })
                        .catch(console.log);
                }
            } catch (error) {
                console.log;
            }

            if (provider) {
                // retrieve pool_positions
                try {
                    if (httpGraphCacheServerDomain) {
                        console.log('fetching pool positions');
                        const allPositionsCacheEndpoint =
                            httpGraphCacheServerDomain + '/pool_positions?';
                        fetch(
                            allPositionsCacheEndpoint +
                                new URLSearchParams({
                                    base: sortedTokens[0].toLowerCase(),
                                    quote: sortedTokens[1].toLowerCase(),
                                    poolIdx: chainData.poolIndex.toString(),
                                    chainId: chainData.chainId,
                                    annotate: 'true', // token quantities
                                    ensResolution: 'true',
                                    omitEmpty: 'true',
                                    omitKnockout: 'true',
                                    addValue: 'true',
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
                                                JSON.stringify(
                                                    graphData.positionsByUser.positions,
                                                ) !== JSON.stringify(updatedPositions)
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

                // retrieve pool_swaps
                try {
                    if (httpGraphCacheServerDomain) {
                        console.log('fetching pool swaps');

                        const poolSwapsCacheEndpoint = httpGraphCacheServerDomain + '/pool_swaps?';

                        fetch(
                            poolSwapsCacheEndpoint +
                                new URLSearchParams({
                                    base: sortedTokens[0].toLowerCase(),
                                    quote: sortedTokens[1].toLowerCase(),
                                    poolIdx: chainData.poolIndex.toString(),
                                    chainId: chainData.chainId,
                                    addValue: 'true',
                                    ensResolution: 'true',
                                    // n: 10 // positive integer	(Optional.) If n and page are provided, query returns a page of results with at most n entries.
                                    // page: 0 // nonnegative integer	(Optional.) If n and page are provided, query returns the page-th page of results. Page numbers are 0-indexed.
                                }),
                        )
                            .then((response) => response?.json())
                            .then((json) => {
                                const poolSwaps = json?.data;

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
        }
    }, [tokenPairStringified, chainData.chainId, provider]);

    const activePeriod = tradeData.activeChartPeriod;

    const fetchCandles = () => {
        if (
            baseTokenAddress &&
            quoteTokenAddress &&
            mainnetBaseTokenAddress &&
            mainnetQuoteTokenAddress &&
            activePeriod
        ) {
            try {
                if (httpGraphCacheServerDomain) {
                    console.log('fetching candles');
                    const candleSeriesCacheEndpoint =
                        httpGraphCacheServerDomain + '/candle_series?';

                    fetch(
                        candleSeriesCacheEndpoint +
                            new URLSearchParams({
                                base: mainnetBaseTokenAddress,
                                quote: mainnetQuoteTokenAddress,
                                poolIdx: chainData.poolIndex.toString(),
                                period: activePeriod.toString(),
                                // period: '86400', // 1 day
                                // period: '300', // 5 minute
                                // time: '1657833300', // optional
                                n: '200', // positive integer
                                page: '0', // nonnegative integer
                                chainId: '0x1',
                                dex: 'all',
                                poolStats: 'true',
                                concise: 'true',
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
    };

    // useEffect(() => {}, [
    //     baseTokenAddress,
    //     quoteTokenAddress,
    //     mainnetBaseTokenAddress,
    //     mainnetQuoteTokenAddress,
    //     activePeriod,
    //     chainData.chainId,
    // ]);

    const poolLiqChangesCacheSubscriptionEndpoint = useMemo(
        () =>
            wssGraphCacheServerDomain +
            '/subscribe_pool_liqchanges?' +
            new URLSearchParams({
                base: baseTokenAddress.toLowerCase(),
                // baseTokenAddress.toLowerCase() || '0x0000000000000000000000000000000000000000',
                quote: quoteTokenAddress.toLowerCase(),
                // quoteTokenAddress.toLowerCase() || '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa',
                poolIdx: chainData.poolIndex.toString(),
                chainId: chainData.chainId,
                ensResolution: 'true',
                annotate: 'true',
                addCachedAPY: 'true',
                omitKnockout: 'true',
                addValue: 'true',
            }),
        [baseTokenAddress, quoteTokenAddress, chainData.chainId],
    );

    const {
        //  sendMessage,
        lastMessage: lastPoolLiqChangeMessage,
        //  readyState
    } = useWebSocket(
        poolLiqChangesCacheSubscriptionEndpoint,
        {
            // share:  true,
            onOpen: () => console.log('pool liqChange subscription opened'),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClose: (event: any) => console.log({ event }),
            // onClose: () => console.log('allPositions websocket connection closed'),
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => shouldNonCandleSubscriptionsReconnect,
        },
        // only connect if base/quote token addresses are available
        baseTokenAddress !== '' && quoteTokenAddress !== '',
    );

    useEffect(() => {
        if (lastPoolLiqChangeMessage !== null) {
            const lastMessageData = JSON.parse(lastPoolLiqChangeMessage.data).data;
            console.log({ lastMessageData });
            if (lastMessageData) {
                Promise.all(lastMessageData.map(getPositionData)).then((updatedPositions) => {
                    dispatch(addPositionsByPool(updatedPositions));
                });
            }
        }
    }, [lastPoolLiqChangeMessage]);

    const candleSubscriptionEndpoint = useMemo(
        () =>
            wssGraphCacheServerDomain +
            '/subscribe_candles?' +
            new URLSearchParams({
                base: mainnetBaseTokenAddress.toLowerCase(),
                quote: mainnetQuoteTokenAddress.toLowerCase(),
                poolIdx: chainData.poolIndex.toString(),
                period: activePeriod.toString(),
                chainId: '0x1',
                dex: 'all',
                poolStats: 'true',
                concise: 'true',
            }),
        [mainnetBaseTokenAddress, mainnetQuoteTokenAddress, chainData.poolIndex, activePeriod],
    );

    const { lastMessage: candlesMessage } = useWebSocket(
        candleSubscriptionEndpoint,
        {
            onOpen: () => {
                console.log({ candleSubscriptionEndpoint });
                fetchCandles();
            },
            onClose: (event) => console.log({ event }),
            shouldReconnect: () => shouldCandleSubscriptionsReconnect,
        },
        // only connect if base/quote token addresses are available
        mainnetBaseTokenAddress !== '' && mainnetQuoteTokenAddress !== '',
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

    const poolSwapsCacheSubscriptionEndpoint = useMemo(
        () =>
            wssGraphCacheServerDomain +
            '/subscribe_pool_swaps?' +
            new URLSearchParams({
                base: baseTokenAddress.toLowerCase(),
                quote: quoteTokenAddress.toLowerCase(),
                poolIdx: chainData.poolIndex.toString(),
                chainId: chainData.chainId,
                addValue: 'true',
                ensResolution: 'true',
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
            onOpen: () => console.log('poolSwaps subscription opened'),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClose: (event: any) => console.log({ event }),
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => shouldNonCandleSubscriptionsReconnect,
        },
        // only connect if base/quote token addresses are available
        baseTokenAddress !== '' && quoteTokenAddress !== '',
    );

    useEffect(() => {
        if (lastPoolSwapsMessage !== null) {
            const lastMessageData = JSON.parse(lastPoolSwapsMessage.data).data;

            if (lastMessageData) {
                dispatch(addSwapsByPool(lastMessageData));
            }
        }
    }, [lastPoolSwapsMessage]);

    const userLiqChangesCacheSubscriptionEndpoint = useMemo(
        () =>
            wssGraphCacheServerDomain +
            '/subscribe_user_liqchanges?' +
            new URLSearchParams({
                user: account || '',
                chainId: chainData.chainId,
                annotate: 'true',
                addCachedAPY: 'true',
                omitKnockout: 'true',
                ensResolution: 'true',
                addValue: 'true',
                // user: account || '0xE09de95d2A8A73aA4bFa6f118Cd1dcb3c64910Dc',
            }),
        [account, chainData.chainId],
    );

    const {
        //  sendMessage,
        lastMessage: lastUserPositionsMessage,
        //  readyState
    } = useWebSocket(
        userLiqChangesCacheSubscriptionEndpoint,
        {
            // share: true,
            onOpen: () => console.log('user liqChange subscription opened'),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClose: (event: any) => console.log({ event }),
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => shouldNonCandleSubscriptionsReconnect,
        },
        // only connect is account is available
        account !== null && account !== '',
    );

    useEffect(() => {
        if (lastUserPositionsMessage !== null) {
            const lastMessageData = JSON.parse(lastUserPositionsMessage.data).data;

            if (lastMessageData) {
                Promise.all(lastMessageData.map(getPositionData)).then((updatedPositions) => {
                    dispatch(addPositionsByUser(updatedPositions));
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
                addValue: 'true',
                ensResolution: 'true',
            }),
        [account, chainData.chainId],
    );

    const { lastMessage: lastUserSwapsMessage } = useWebSocket(
        userSwapsCacheSubscriptionEndpoint,
        {
            // share: true,
            onOpen: () => console.log('user swaps subscription opened'),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClose: (event: any) => console.log({ event }),
            // onClose: () => console.log('userSwaps websocket connection closed'),
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => shouldNonCandleSubscriptionsReconnect,
        },
        // only connect if account is available
        account !== null && account !== '',
    );

    useEffect(() => {
        if (lastUserSwapsMessage !== null) {
            const lastMessageData = JSON.parse(lastUserSwapsMessage.data).data;
            if (lastMessageData) {
                dispatch(addSwapsByUser(lastMessageData));
            }
        }
    }, [lastUserSwapsMessage]);

    const [baseTokenBalance, setBaseTokenBalance] = useState<string>('');
    const [quoteTokenBalance, setQuoteTokenBalance] = useState<string>('');
    const [baseTokenDexBalance, setBaseTokenDexBalance] = useState<string>('');
    const [quoteTokenDexBalance, setQuoteTokenDexBalance] = useState<string>('');

    const [poolPriceNonDisplay, setPoolPriceNonDisplay] = useState<number | undefined>(undefined);
    const [poolPriceDisplay, setPoolPriceDisplay] = useState<number | undefined>(undefined);

    // console.log({ baseTokenBalance });
    // console.log({ quoteTokenBalance });
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
                crocEnv &&
                account &&
                // isAuthenticated &&
                // isWeb3Enabled &&
                tradeData.baseToken.address &&
                tradeData.quoteToken.address
            ) {
                crocEnv
                    .token(tradeData.baseToken.address)
                    .walletDisplay(account)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .then((bal: any) => setBaseTokenBalance(bal));
                crocEnv
                    .token(tradeData.baseToken.address)
                    .balanceDisplay(account)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .then((bal: any) => setBaseTokenDexBalance(bal));
                crocEnv
                    .token(tradeData.quoteToken.address)
                    .walletDisplay(account)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .then((bal: any) => setQuoteTokenBalance(bal));
                crocEnv
                    .token(tradeData.quoteToken.address)
                    .balanceDisplay(account)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .then((bal: any) => setQuoteTokenDexBalance(bal));
            }
        })();
    }, [
        crocEnv,
        // chainData.chainId,
        account,
        // isWeb3Enabled,
        // isAuthenticated,
        tokenPair?.dataTokenA?.address,
        tokenPair?.dataTokenB?.address,
        lastBlockNumber,
        // provider,
    ]);

    const [tokenAAllowance, setTokenAAllowance] = useState<string>('');
    const [tokenBAllowance, setTokenBAllowance] = useState<string>('');

    const [recheckTokenAApproval, setRecheckTokenAApproval] = useState<boolean>(false);
    const [recheckTokenBApproval, setRecheckTokenBApproval] = useState<boolean>(false);

    const tokenAAddress = tokenPair?.dataTokenA?.address;
    const tokenADecimals = tokenPair?.dataTokenA?.decimals;
    const tokenBAddress = tokenPair?.dataTokenB?.address;
    const tokenBDecimals = tokenPair?.dataTokenB?.decimals;
    // useEffect to check if user has approved CrocSwap to sell the token A
    useEffect(() => {
        (async () => {
            if (crocEnv && account && tokenAAddress) {
                try {
                    const allowance = await crocEnv.token(tokenAAddress).allowance(account);
                    setTokenAAllowance(toDisplayQty(allowance, tokenADecimals));
                } catch (err) {
                    console.log(err);
                }
                setRecheckTokenAApproval(false);
            }
        })();
    }, [crocEnv, tokenAAddress, lastBlockNumber, account, recheckTokenAApproval, account]);

    // useEffect to check if user has approved CrocSwap to sell the token B
    useEffect(() => {
        (async () => {
            if (crocEnv && tokenBAddress && tokenBDecimals && account) {
                try {
                    const allowance = await crocEnv.token(tokenBAddress).allowance(account);
                    setTokenBAllowance(toDisplayQty(allowance, tokenBDecimals));
                } catch (err) {
                    console.log(err);
                }
                setRecheckTokenBApproval(false);
            }
        })();
    }, [crocEnv, tokenBAddress, lastBlockNumber, account, recheckTokenBApproval]);

    const graphData = useAppSelector((state) => state.graphData);

    const getSwapData = async (swap: ISwap): Promise<ISwap> => {
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

        const poolPriceInTicks = Math.log(poolPriceNonDisplay) / Math.log(1.0001);
        position.poolPriceInTicks = poolPriceInTicks;

        const isPositionInRange =
            position.positionType === 'ambient' ||
            (position.bidTick <= poolPriceInTicks && poolPriceInTicks <= position.askTick);

        position.isPositionInRange = isPositionInRange;

        const baseTokenDecimals = position.baseDecimals;
        const quoteTokenDecimals = position.quoteDecimals;

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

        if (position.positionType !== 'ambient') {
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

        if (position.positionType !== 'ambient') {
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

        if (position.positionLiqBaseDecimalCorrected) {
            const liqBaseNum = position.positionLiqBaseDecimalCorrected;

            const baseLiqDisplayTruncated =
                liqBaseNum === 0
                    ? '0'
                    : liqBaseNum < 0.0001
                    ? liqBaseNum.toExponential(2)
                    : liqBaseNum < 2
                    ? liqBaseNum.toPrecision(3)
                    : liqBaseNum >= 100000
                    ? formatAmount(liqBaseNum)
                    : // ? baseLiqDisplayNum.toExponential(2)
                      liqBaseNum.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });

            position.positionLiqBaseTruncated = baseLiqDisplayTruncated;
        }
        if (position.positionLiqQuoteDecimalCorrected) {
            const liqQuoteNum = position.positionLiqQuoteDecimalCorrected;

            const quoteLiqDisplayTruncated =
                liqQuoteNum === 0
                    ? '0'
                    : liqQuoteNum < 0.0001
                    ? liqQuoteNum.toExponential(2)
                    : liqQuoteNum < 2
                    ? liqQuoteNum.toPrecision(3)
                    : liqQuoteNum >= 100000
                    ? formatAmount(liqQuoteNum)
                    : // ? quoteLiqDisplayNum.toExponential(2)
                      liqQuoteNum.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                      });
            position.positionLiqQuoteTruncated = quoteLiqDisplayTruncated;
        }

        return position;
    };

    useEffect(() => {
        if (isAuthenticated && account) {
            console.log('fetching user positions');

            const userPositionsCacheEndpoint = httpGraphCacheServerDomain + '/user_positions?';

            try {
                fetch(
                    userPositionsCacheEndpoint +
                        new URLSearchParams({
                            user: account,
                            chainId: chainData.chainId,
                            ensResolution: 'true',
                            annotate: 'true',
                            omitEmpty: 'true',
                            omitKnockout: 'true',
                            addValue: 'true',
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

            console.log('fetching user limit orders ');

            const userLimitOrderStatesCacheEndpoint =
                httpGraphCacheServerDomain + '/user_limit_order_states?';
            try {
                fetch(
                    userLimitOrderStatesCacheEndpoint +
                        new URLSearchParams({
                            user: account,
                            chainId: chainData.chainId,
                            ensResolution: 'true',
                        }),
                )
                    .then((response) => response?.json())
                    .then((json) => {
                        const userLimitOrders = json?.data;

                        if (userLimitOrders) {
                            dispatch(
                                setLimitOrdersByUser({
                                    dataReceived: true,
                                    limitOrders: userLimitOrders,
                                }),
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
                            addValue: 'true',
                            ensResolution: 'true',
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
        setBaseTokenBalance('0');
        setQuoteTokenBalance('0');
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
            if (crocEnv && account) {
                crocEnv
                    .tokenEth()
                    .wallet(account)
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
    }, [crocEnv, account, lastBlockNumber]);

    const [gasPriceinGwei, setGasPriceinGwei] = useState<number | undefined>();

    useEffect(() => {
        fetch(
            'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=KNJM7A9ST1Q1EESYXPPQITIP7I8EFSY456',
        )
            .then((response) => response.json())
            .then((response) => {
                if (response.result.ProposeGasPrice) {
                    setGasPriceinGwei(parseInt(response.result.ProposeGasPrice));
                }
            })
            .catch(console.log);
    }, [lastBlockNumber]);

    const shouldDisplayAccountTab = isAuthenticated && isWeb3Enabled && account != '';

    const [isModalOpenWallet, openModalWallet, closeModalWallet] = useModal();

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
        openModalWallet: openModalWallet,
    };

    // props for <Swap/> React element
    const swapProps = {
        crocEnv: crocEnv,
        importedTokens: importedTokens,
        setImportedTokens: setImportedTokens,
        searchableTokens: searchableTokens,
        provider: provider,
        swapSlippage: swapSlippage,
        isPairStable: isPairStable,
        gasPriceinGwei: gasPriceinGwei,
        nativeBalance: nativeBalance,
        lastBlockNumber: lastBlockNumber,
        baseTokenBalance: baseTokenBalance,
        quoteTokenBalance: quoteTokenBalance,
        baseTokenDexBalance: baseTokenDexBalance,
        quoteTokenDexBalance: quoteTokenDexBalance,
        isSellTokenBase: isTokenABase,
        tokenPair: tokenPair,
        poolPriceDisplay: poolPriceDisplay,
        tokenAAllowance: tokenAAllowance,
        setRecheckTokenAApproval: setRecheckTokenAApproval,
        chainId: chainData.chainId,
        activeTokenListsChanged: activeTokenListsChanged,
        indicateActiveTokenListsChanged: indicateActiveTokenListsChanged,
        openModalWallet: openModalWallet,
    };

    // props for <Swap/> React element on trade route
    const swapPropsTrade = {
        crocEnv: crocEnv,
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
        baseTokenBalance: baseTokenBalance,
        quoteTokenBalance: quoteTokenBalance,
        baseTokenDexBalance: baseTokenDexBalance,
        quoteTokenDexBalance: quoteTokenDexBalance,
        isSellTokenBase: isTokenABase,
        tokenPair: tokenPair,
        poolPriceDisplay: poolPriceDisplay,
        setRecheckTokenAApproval: setRecheckTokenAApproval,
        tokenAAllowance: tokenAAllowance,
        chainId: chainData.chainId,
        activeTokenListsChanged: activeTokenListsChanged,
        indicateActiveTokenListsChanged: indicateActiveTokenListsChanged,
        openModalWallet: openModalWallet,
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
        baseTokenBalance: baseTokenBalance,
        quoteTokenBalance: quoteTokenBalance,
        baseTokenDexBalance: baseTokenDexBalance,
        quoteTokenDexBalance: quoteTokenDexBalance,
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
        openModalWallet: openModalWallet,
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
        tokenAAllowance: tokenAAllowance,
        setRecheckTokenAApproval: setRecheckTokenAApproval,
        baseTokenBalance: baseTokenBalance,
        quoteTokenBalance: quoteTokenBalance,
        baseTokenDexBalance: baseTokenDexBalance,
        quoteTokenDexBalance: quoteTokenDexBalance,
        tokenBAllowance: tokenBAllowance,
        setRecheckTokenBApproval: setRecheckTokenBApproval,
        chainId: chainData.chainId,
        activeTokenListsChanged: activeTokenListsChanged,
        indicateActiveTokenListsChanged: indicateActiveTokenListsChanged,
        openModalWallet: openModalWallet,
        ambientApy: ambientApy,
    };

    function toggleSidebar() {
        setShowSidebar(!showSidebar);
        setSidebarManuallySet(true);
    }

    function handleTabChangedBasedOnRoute() {
        const onTradeRoute = location.pathname.includes('trade');

        const marketTabBasedOnRoute = onTradeRoute ? 0 : 0;
        const orderTabBasedOnRoute = onTradeRoute ? 1 : 0;
        const rangeTabBasedOnRoute = onTradeRoute ? 2 : 0;
        setOutsideControl(true);
        if (location.pathname === '/trade/market') {
            setSelectedOutsideTab(marketTabBasedOnRoute);
        } else if (location.pathname === '/trade/limit') {
            setSelectedOutsideTab(orderTabBasedOnRoute);
        } else if (
            location.pathname === '/trade/range' ||
            location.pathname.includes('/trade/edit/')
        ) {
            setSelectedOutsideTab(rangeTabBasedOnRoute);
        } else {
            setSelectedOutsideTab(0);
        }
    }

    useEffect(() => {
        if (location.pathname.includes('account') || location.pathname.includes('analytics')) {
            setShowSidebar(false);
        }

        handleTabChangedBasedOnRoute();
    }, [location.pathname]);

    // market - /trade/market
    // limit - /trade/limit
    // range - /trade/range

    const [selectedOutsideTab, setSelectedOutsideTab] = useState(0);
    const [outsideControl, setOutsideControl] = useState(false);

    // props for <Sidebar/> React element
    const sidebarProps = {
        isDenomBase: tradeData.isDenomBase,
        showSidebar: showSidebar,
        toggleSidebar: toggleSidebar,
        chainId: chainData.chainId,

        currentTxActiveInTransactions: currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions: setCurrentTxActiveInTransactions,
        isShowAllEnabled: isShowAllEnabled,
        setIsShowAllEnabled: setIsShowAllEnabled,
        expandTradeTable: expandTradeTable,
        setExpandTradeTable: setExpandTradeTable,
        tokenMap: tokenMap,
        lastBlockNumber: lastBlockNumber,
        favePools: favePools,

        selectedOutsideTab: selectedOutsideTab,
        setSelectedOutsideTab: setSelectedOutsideTab,
        outsideControl: outsideControl,
        setOutsideControl: setOutsideControl,

        currentPositionActive: currentPositionActive,
        setCurrentPositionActive: setCurrentPositionActive,
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

        if (!poolPriceDisplay) return;
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
        if (isDenomBase !== undefined) {
            if (tradeData.isDenomBase !== isDenomBase) {
                dispatch(setDenomInBase(isDenomBase));
            }
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

    const [isGlobalModalOpen, openGlobalModal, closeGlobalModal, currentContent, title] =
        useGlobalModal();

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
                                    crocEnv={crocEnv}
                                    provider={provider}
                                    baseTokenAddress={baseTokenAddress}
                                    quoteTokenAddress={quoteTokenAddress}
                                    tokenPair={tokenPair}
                                    account={account ?? ''}
                                    isAuthenticated={isAuthenticated}
                                    isWeb3Enabled={isWeb3Enabled}
                                    lastBlockNumber={lastBlockNumber}
                                    isTokenABase={isTokenABase}
                                    poolPriceDisplay={poolPriceDisplay}
                                    chainId={chainData.chainId}
                                    chainData={chainData}
                                    currentTxActiveInTransactions={currentTxActiveInTransactions}
                                    setCurrentTxActiveInTransactions={
                                        setCurrentTxActiveInTransactions
                                    }
                                    isShowAllEnabled={isShowAllEnabled}
                                    setIsShowAllEnabled={setIsShowAllEnabled}
                                    expandTradeTable={expandTradeTable}
                                    setExpandTradeTable={setExpandTradeTable}
                                    tokenMap={tokenMap}
                                    favePools={favePools}
                                    addPoolToFaves={addPoolToFaves}
                                    removePoolFromFaves={removePoolFromFaves}
                                    selectedOutsideTab={selectedOutsideTab}
                                    setSelectedOutsideTab={setSelectedOutsideTab}
                                    outsideControl={outsideControl}
                                    setOutsideControl={setOutsideControl}
                                    currentPositionActive={currentPositionActive}
                                    setCurrentPositionActive={setCurrentPositionActive}
                                    openGlobalModal={openGlobalModal}
                                    closeGlobalModal={closeGlobalModal}
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
                        <Route
                            path='app/chat'
                            element={
                                <Chat
                                    ensName={ensName}
                                    connectedAccount={account ? account : ''}
                                    fullScreen={true}
                                />
                            }
                        />

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
                                    selectedOutsideTab={selectedOutsideTab}
                                    setSelectedOutsideTab={setSelectedOutsideTab}
                                    outsideControl={outsideControl}
                                    setOutsideControl={setOutsideControl}
                                    userAccount={true}
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
                                    selectedOutsideTab={selectedOutsideTab}
                                    setSelectedOutsideTab={setSelectedOutsideTab}
                                    outsideControl={outsideControl}
                                    setOutsideControl={setOutsideControl}
                                    userAccount={false}
                                />
                            }
                        />

                        <Route path='swap' element={<Swap {...swapProps} />} />
                        <Route path='tos' element={<TermsOfService />} />
                        <Route
                            path='testpage'
                            element={<TestPage openGlobalModal={openGlobalModal} />}
                        />
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
                {currentLocation !== '/app/chat' && currentLocation !== '/' && (
                    <Chat
                        ensName={ensName}
                        connectedAccount={account ? account : ''}
                        fullScreen={false}
                    />
                )}
            </div>
            <SidebarFooter />
            <GlobalModal
                isGlobalModalOpen={isGlobalModalOpen}
                closeGlobalModal={closeGlobalModal}
                openGlobalModal={openGlobalModal}
                currentContent={currentContent}
                title={title}
            />
            {isModalOpenWallet && (
                <WalletModal
                    closeModalWallet={closeModalWallet}
                    isAuthenticating={isAuthenticating}
                    isAuthenticated={isAuthenticated}
                    isWeb3Enabled={isWeb3Enabled}
                    authenticate={authenticate}
                    enableWeb3={enableWeb3}
                    // authError={authError}
                />
            )}
        </>
    );
}
