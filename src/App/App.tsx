/** ***** Import React and Dongles *******/
import { useEffect, useState, useMemo } from 'react';
import {
    Routes,
    Route,
    useLocation,
    Navigate,
    useNavigate,
} from 'react-router-dom';

import { useIdleTimer } from 'react-idle-timer';

import {
    resetUserGraphData,
    setPositionsByPool,
    setPositionsByUser,
    setChangesByUser,
    setChangesByPool,
    setLiquidity,
    setPoolVolumeSeries,
    setPoolTvlSeries,
    addPositionsByUser,
    addPositionsByPool,
    setLimitOrdersByUser,
    setLimitOrdersByPool,
    CandlesByPoolAndDuration,
    CandleData,
    addChangesByUser,
    setLastBlock,
    addLimitOrderChangesByUser,
    setLeaderboardByPool,
    setDataLoadingStatus,
    resetConnectedUserDataLoadingStatus,
    addChangesByPool,
    addLimitOrderChangesByPool,
} from '../utils/state/graphDataSlice';

import { useAccount, useDisconnect, useProvider, useSigner } from 'wagmi';

import useWebSocket from 'react-use-websocket';
import {
    sortBaseQuoteTokens,
    toDisplayPrice,
    CrocEnv,
    toDisplayQty,
} from '@crocswap-libs/sdk';
import { resetReceiptData } from '../utils/state/receiptDataSlice';

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
import sum from 'hash-sum';

/** * **** Import Local Files *******/
import './App.css';
import { useAppDispatch, useAppSelector } from '../utils/hooks/reduxToolkit';
import {
    defaultTokens,
    getDefaultPairForChain,
} from '../utils/data/defaultTokens';
import initializeUserLocalStorage from './functions/initializeUserLocalStorage';
import {
    LimitOrderIF,
    TokenIF,
    TransactionIF,
    PositionIF,
} from '../utils/interfaces/exports';
import { fetchTokenLists } from './functions/fetchTokenLists';
import {
    setAdvancedHighTick,
    setAdvancedLowTick,
    setDenomInBase,
    setDidUserFlipDenom,
    setLimitTick,
    setLiquidityFee,
    setPoolPriceNonDisplay,
    setPrimaryQuantityRange,
    setMainnetBaseTokenReduxAddress,
    setMainnetQuoteTokenReduxAddress,
    candleDomain,
    setAdvancedMode,
} from '../utils/state/tradeDataSlice';
import { memoizeQuerySpotPrice } from './functions/querySpotPrice';
import { memoizeFetchAddress } from './functions/fetchAddress';
import {
    memoizeFetchErc20TokenBalances,
    memoizeFetchNativeTokenBalance,
} from './functions/fetchTokenBalances';
import { memoizePoolStats } from './functions/getPoolStats';
import { getNFTs } from './functions/getNFTs';
import { useFavePools, favePoolsMethodsIF } from './hooks/useFavePools';
import { useAppChain } from './hooks/useAppChain';
import {
    resetTokenData,
    resetUserAddresses,
    setAddressAtLogin,
    setAddressCurrent,
    setEnsNameCurrent,
    setEnsOrAddressTruncated,
    setErc20Tokens,
    setIsLoggedIn,
    setIsUserIdle,
    setNativeToken,
    setRecentTokens,
} from '../utils/state/userDataSlice';
import { isStablePair } from '../utils/data/stablePairs';
import { useTokenMap } from '../utils/hooks/useTokenMap';
import { testTokenMap } from '../utils/data/testTokenMap';
import { APP_ENVIRONMENT, IS_LOCAL_ENV, ZERO_ADDRESS } from '../constants';
import { useModal } from '../components/Global/Modal/useModal';
import { useGlobalModal } from './components/GlobalModal/useGlobalModal';
import { getVolumeSeries } from './functions/getVolumeSeries';
import { getTvlSeries } from './functions/getTvlSeries';
import GlobalModal from './components/GlobalModal/GlobalModal';
import { memoizeTokenPrice } from './functions/fetchTokenPrice';
import ChatPanel from '../components/Chat/ChatPanel';
import {
    getPositionData,
    memoizePositionUpdate,
} from './functions/getPositionData';
import { getLimitOrderData } from './functions/getLimitOrderData';
import { fetchPoolRecentChanges } from './functions/fetchPoolRecentChanges';
import { fetchUserRecentChanges } from './functions/fetchUserRecentChanges';
import { getTransactionData } from './functions/getTransactionData';
import AppOverlay from '../components/Global/AppOverlay/AppOverlay';
import { getLiquidityFee } from './functions/getLiquidityFee';
import trimString from '../utils/functions/trimString';
import { useToken } from './hooks/useToken';
import { useSidebar } from './hooks/useSidebar';
import useDebounce from './hooks/useDebounce';
import { useRecentTokens } from './hooks/useRecentTokens';
import { useTokenSearch } from './hooks/useTokenSearch';
import WalletModalWagmi from './components/WalletModal/WalletModalWagmi';
import Moralis from 'moralis';
import { usePoolList } from './hooks/usePoolList';
import { recentPoolsMethodsIF, useRecentPools } from './hooks/useRecentPools';
import useMediaQuery from '../utils/hooks/useMediaQuery';
import { useGlobalPopup } from './components/GlobalPopup/useGlobalPopup';
import GlobalPopup from './components/GlobalPopup/GlobalPopup';
import RangeAdd from '../pages/Trade/RangeAdd/RangeAdd';
import { checkBlacklist } from '../utils/data/blacklist';
import { memoizePoolLiquidity } from './functions/getPoolLiquidity';
import { getMoneynessRank } from '../utils/functions/getMoneynessRank';
import { Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { useTermsOfService, tosMethodsIF } from './hooks/useTermsOfService';
import { useSlippage, SlippageMethodsIF } from './hooks/useSlippage';
import { slippage } from '../utils/data/slippage';
import {
    useChartSettings,
    chartSettingsMethodsIF,
} from './hooks/useChartSettings';
import { useSkin } from './hooks/useSkin';
import {
    useExchangePrefs,
    dexBalanceMethodsIF,
} from './hooks/useExchangePrefs';
import { useSkipConfirm, skipConfirmIF } from './hooks/useSkipConfirm';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import { mktDataChainId } from '../utils/data/chains';
import useKeyPress from './hooks/useKeyPress';
import { ackTokensMethodsIF, useAckTokens } from './hooks/useAckTokens';
import { topPoolIF, useTopPools } from './hooks/useTopPools';
import { formSlugForPairParams } from './functions/urlSlugs';
import useChatApi from '../components/Chat/Service/ChatApi';

const cachedFetchAddress = memoizeFetchAddress();
const cachedFetchNativeTokenBalance = memoizeFetchNativeTokenBalance();
const cachedFetchErc20TokenBalances = memoizeFetchErc20TokenBalances();
const cachedFetchTokenPrice = memoizeTokenPrice();
const cachedQuerySpotPrice = memoizeQuerySpotPrice();
const cachedLiquidityQuery = memoizePoolLiquidity();
const cachedPositionUpdateQuery = memoizePositionUpdate();
const cachedPoolStatsFetch = memoizePoolStats();

const httpGraphCacheServerDomain = 'https://809821320828123.de:5000';
const wssGraphCacheServerDomain = 'wss://809821320828123.de:5000';

const shouldCandleSubscriptionsReconnect = true;
const shouldNonCandleSubscriptionsReconnect = true;

const startMoralis = async () => {
    await Moralis.start({
        apiKey: 'xcsYd8HnEjWqQWuHs63gk7Oehgbusa05fGdQnlVPFV9qMyKYPcRlwBDLd1C2SVx5',
        // ...and any other configuration
    });
};

const LIQUIDITY_FETCH_PERIOD_MS = 60000; // We will call (and cache) fetchLiquidity every N milliseconds

startMoralis();

/** ***** React Function *******/
export default function App() {
    const navigate = useNavigate();

    // useKeyboardShortcuts()

    const { disconnect } = useDisconnect();
    const [isTutorialMode, setIsTutorialMode] = useState(false);

    // hooks to manage ToS agreements in the app
    const walletToS: tosMethodsIF = useTermsOfService(
        'wallet',
        process.env.REACT_APP_WALLET_TOS_CID as string,
    );
    const chatToS: tosMethodsIF = useTermsOfService(
        'chat',
        process.env.REACT_APP_CHAT_TOS_CID as string,
    );
    // this line is just here to make the linter happy
    // it should be removed when the chatToS line is moved
    // please and thank you
    false && chatToS;

    // hooks to manage slippage in the app
    const swapSlippage: SlippageMethodsIF = useSlippage('swap', slippage.swap);
    const mintSlippage: SlippageMethodsIF = useSlippage('mint', slippage.mint);
    const repoSlippage: SlippageMethodsIF = useSlippage(
        'repo',
        slippage.reposition,
    );

    // hook to manage chart settings
    const chartSettings: chartSettingsMethodsIF = useChartSettings();

    // hook to manage favorite pools in the app
    const favePools: favePoolsMethodsIF = useFavePools();

    // hook to manage exchange balance preferences
    const dexBalPrefSwap: dexBalanceMethodsIF = useExchangePrefs('swap');
    const dexBalPrefLimit: dexBalanceMethodsIF = useExchangePrefs('limit');
    const dexBalPrefRange: dexBalanceMethodsIF = useExchangePrefs('range');

    // hooks to manage user preferences to skip confirmation modals
    const bypassConfirmSwap: skipConfirmIF = useSkipConfirm('swap');
    const bypassConfirmLimit: skipConfirmIF = useSkipConfirm('limit');
    const bypassConfirmRange: skipConfirmIF = useSkipConfirm('range');
    const bypassConfirmRepo: skipConfirmIF = useSkipConfirm('repo');

    // hook to manage app skin
    const skin = useSkin('purple_dark');
    false && skin;

    const { address: account, isConnected } = useAccount();

    useEffect(() => {
        if (account && checkBlacklist(account)) {
            disconnect();
        }
        if (!account) {
            setCrocEnv(undefined);
            setIsShowAllEnabled(true);
        }
    }, [account]);

    const tradeData = useAppSelector((state) => state.tradeData);
    const location = useLocation();

    const ticksInParams =
        location.pathname.includes('lowTick') &&
        location.pathname.includes('highTick');

    // hook to check if token addresses in URL match token addresses in RTK
    const rtkMatchesParams = useMemo(() => {
        // output value, false is default return
        let matching = false;
        // address of token A as held by RTK
        const rtkTokenA = tradeData.tokenA.address;
        // address of token B as held by RTK
        const rtkTokenB = tradeData.tokenB.address;
        // current URL pathway
        const { pathname } = location;
        // make sure app is on a pathway with two URLs in params
        if (pathname.includes('tokenA') && pathname.includes('tokenB')) {
            // function to extract token addresses from URL string (absolute)
            const getAddrFromParams = (token: string) => {
                const idx = pathname.indexOf(token);
                const address = pathname.substring(idx + 7, idx + 49);
                return address;
            };
            // address of token A from URL params
            const addrTokenA = getAddrFromParams('tokenA');
            // address of token B from URL params
            const addrTokenB = getAddrFromParams('tokenB');
            // check if URL param addresses match RTK token addresses
            if (
                addrTokenA.toLowerCase() === rtkTokenA.toLowerCase() &&
                addrTokenB.toLowerCase() === rtkTokenB.toLowerCase()
            ) {
                // if match set return value as true
                matching = true;
            }
        }
        // return output variable (boolean)
        return matching;
        // run hook when URL or token addresses in RTK change
    }, [location, tradeData.tokenA.address, tradeData.tokenB.address]);

    const onIdle = () => {
        IS_LOCAL_ENV && console.debug('user is idle');
        dispatch(setIsUserIdle(true));
        // reload to avoid stale wallet connections and excessive state accumulation
        window.location.reload();
    };

    const onActive = () => {
        IS_LOCAL_ENV && console.debug('user is active');
        dispatch(setIsUserIdle(false));
    };

    useIdleTimer({
        //    onPrompt,
        onIdle,
        onActive,
        //    onAction,
        timeout: 1000 * 60 * 60, // set user to idle after 60 minutes
        promptTimeout: 0,
        events: [
            'mousemove',
            'keydown',
            'wheel',
            'DOMMouseScroll',
            'mousewheel',
            'mousedown',
            'touchstart',
            'touchmove',
            'MSPointerDown',
            'MSPointerMove',
            'visibilitychange',
        ],
        immediateEvents: [],
        debounce: 0,
        throttle: 0,
        eventsThrottle: 200,
        element: document,
        startOnMount: true,
        startManually: false,
        stopOnIdle: false,
        crossTab: false,
        name: 'idle-timer',
        syncTimers: 0,
        leaderElection: false,
    });

    const userData = useAppSelector((state) => state.userData);

    const isUserLoggedIn = isConnected;
    const isUserIdle = userData.isUserIdle;

    // custom hook to manage chain the app is using
    // `chainData` is data on the current chain retrieved from our SDK
    // `isChainSupported` is a boolean indicating whether the chain is supported by Ambient
    const [chainData, isChainSupported] = useAppChain(isUserLoggedIn);

    // hook to manage top pools data
    const topPools: topPoolIF[] = useTopPools(chainData.chainId);

    // hook to manage acknowledged tokens
    const ackTokens: ackTokensMethodsIF = useAckTokens();

    // allow a local environment variable to be defined in [app_repo]/.env.local to turn off connections to the cache server
    const isServerEnabled =
        process.env.REACT_APP_CACHE_SERVER_IS_ENABLED !== undefined
            ? process.env.REACT_APP_CACHE_SERVER_IS_ENABLED.toLowerCase() ===
              'true'
            : true;

    const [isChatEnabled, setIsChatEnabled] = useState(
        process.env.REACT_APP_CHAT_IS_ENABLED !== undefined
            ? process.env.REACT_APP_CHAT_IS_ENABLED.toLowerCase() === 'true'
            : true,
    );

    const [loginCheckDelayElapsed, setLoginCheckDelayElapsed] = useState(false);

    useEffect(() => {
        IS_LOCAL_ENV && console.debug('setting login check delay');
        const timer = setTimeout(() => {
            setLoginCheckDelayElapsed(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (isConnected || (isConnected === false && loginCheckDelayElapsed)) {
            if (isConnected && userData.isLoggedIn !== isConnected && account) {
                IS_LOCAL_ENV && console.debug('settting to logged in');
                dispatch(setIsLoggedIn(true));
                dispatch(setAddressAtLogin(account));
            } else if (!isConnected && userData.isLoggedIn !== false) {
                IS_LOCAL_ENV && console.debug('setting to logged out');
                dispatch(setIsLoggedIn(false));
                dispatch(resetUserAddresses());
            }
        }
    }, [loginCheckDelayElapsed, isConnected]);

    // Used in Portfolio/Account related pages for defining token universe.
    // Ideally this is inefficient, because we're also using useToken() hook
    // in parrallel which internally uses this hook. So there's some duplicated
    // effort
    const tokensOnActiveLists = useTokenMap();

    const [candleData, setCandleData] = useState<
        CandlesByPoolAndDuration | undefined
    >();
    const [isCandleDataNull, setIsCandleDataNull] = useState(false);

    const [isCandleSelected, setIsCandleSelected] = useState<
        boolean | undefined
    >();

    // Range States
    const [maxRangePrice, setMaxRangePrice] = useState<number>(0);
    const [minRangePrice, setMinRangePrice] = useState<number>(0);
    const [simpleRangeWidth, setSimpleRangeWidth] = useState<number>(10);
    const [repositionRangeWidth, setRepositionRangeWidth] =
        useState<number>(10);
    const [
        rescaleRangeBoundariesWithSlider,
        setRescaleRangeBoundariesWithSlider,
    ] = useState<boolean>(false);
    const [chartTriggeredBy, setChartTriggeredBy] = useState<string>('');

    const [
        verifyToken,
        getAmbientTokens,
        getTokensOnChain,
        getTokenByAddress,
        getTokensByName,
    ] = useToken(chainData.chainId);

    // hook to manage recent pool data in-session
    const recentPools: recentPoolsMethodsIF = useRecentPools(
        chainData.chainId,
        tradeData.tokenA,
        tradeData.tokenB,
        verifyToken,
        ackTokens,
    );

    const [tokenPairLocal, setTokenPairLocal] = useState<string[] | null>(null);

    const [isShowAllEnabled, setIsShowAllEnabled] = useState(true);
    const [currentTxActiveInTransactions, setCurrentTxActiveInTransactions] =
        useState('');
    const [currentPositionActive, setCurrentPositionActive] = useState('');
    const [expandTradeTable, setExpandTradeTable] = useState(false);
    // eslint-disable-next-line
    const [userIsOnline, setUserIsOnline] = useState(navigator.onLine);

    const [fetchingCandle, setFetchingCandle] = useState(false);

    const [ethMainnetUsdPrice, setEthMainnetUsdPrice] = useState<
        number | undefined
    >();

    window.ononline = () => setUserIsOnline(true);
    window.onoffline = () => setUserIsOnline(false);

    const [crocEnv, setCrocEnv] = useState<CrocEnv | undefined>();

    const provider = useProvider();
    const isInitialized = !!provider;
    const {
        data: signer,
        isError,
        error,
        status: signerStatus,
        //  isLoading
    } = useSigner();

    const setNewCrocEnv = async () => {
        if (APP_ENVIRONMENT === 'local') {
            console.debug({ provider });
            console.debug({ signer });
            console.debug({ crocEnv });
            console.debug({ signerStatus });
        }
        if (isError) {
            console.error({ error });
            setCrocEnv(undefined);
        } else if (!provider && !signer) {
            APP_ENVIRONMENT === 'local' &&
                console.debug('setting crocEnv to undefined');
            setCrocEnv(undefined);
            return;
        } else if (!signer && !!crocEnv) {
            APP_ENVIRONMENT === 'local' && console.debug('keeping provider');
            return;
        } else if (provider && !crocEnv) {
            const newCrocEnv = new CrocEnv(signer?.provider || provider);
            setCrocEnv(newCrocEnv);
        } else {
            // If signer and provider are set to different chains (as can happen)
            // after a network switch, it causes a lot of performance killing timeouts
            // and errors
            if (
                (await signer?.getChainId()) ==
                (await provider.getNetwork()).chainId
            ) {
                const newCrocEnv = new CrocEnv(signer?.provider || provider);
                APP_ENVIRONMENT === 'local' && console.debug({ newCrocEnv });
                setCrocEnv(newCrocEnv);
            }
        }
    };

    useEffect(() => {
        setNewCrocEnv();
    }, [signerStatus === 'success', crocEnv === undefined, chainData.chainId]);

    useEffect(() => {
        if (provider) {
            (async () => {
                IS_LOCAL_ENV &&
                    console.debug('fetching WETH price from mainnet');
                const mainnetEthPrice = await cachedFetchTokenPrice(
                    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                    '0x1',
                );
                const usdPrice = mainnetEthPrice?.usdPrice;
                setEthMainnetUsdPrice(usdPrice);
            })();
        }
    }, [provider]);

    const poolList = usePoolList(chainData.chainId, chainData.poolIndex);

    useEffect(() => {
        IS_LOCAL_ENV &&
            console.debug(
                'resetting user token data and address because connected account changed',
            );
        dispatch(resetTokenData());
        if (account) {
            dispatch(setAddressCurrent(account));
        } else {
            dispatch(setAddressCurrent(undefined));
        }
    }, [isUserLoggedIn, account]);

    const dispatch = useAppDispatch();

    // current configurations of trade as specified by the user
    const currentPoolInfo = tradeData;

    // all tokens from active token lists
    const [searchableTokens, setSearchableTokens] =
        useState<TokenIF[]>(defaultTokens);

    useEffect(() => {
        setSearchableTokens(getTokensOnChain(chainData.chainId));
    }, [chainData.chainId, getTokensOnChain(chainData.chainId).length]);

    const [needTokenLists, setNeedTokenLists] = useState(true);

    // trigger a useEffect() which needs to run when new token lists are received
    // true vs false is an arbitrary distinction here
    const [tokenListsReceived, indicateTokenListsReceived] = useState(false);

    if (needTokenLists) {
        IS_LOCAL_ENV && console.debug('fetching token lists');
        setNeedTokenLists(false);
        fetchTokenLists(tokenListsReceived, indicateTokenListsReceived);
    }

    useEffect(() => {
        IS_LOCAL_ENV && console.debug('initializing local storage');
        initializeUserLocalStorage();
    }, [tokenListsReceived]);

    async function pollBlockNum(): Promise<void> {
        return fetch(chainData.nodeUrl, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_blockNumber',
                params: [],
                id: 'app-blockNum-sub', // Arbitary string (see JSON-RPC spec)
            }),
        })
            .then((response) => response?.json())
            .then((json) => json?.result)
            .then(parseInt)
            .then((blockNum) => {
                if (blockNum > lastBlockNumber) {
                    setLastBlockNumber(blockNum);
                    dispatch(setLastBlock(blockNum));
                }
            })
            .catch(console.error);
    }

    const BLOCK_NUM_POLL_MS = 2000;
    useEffect(() => {
        (async () => {
            // Don't use polling, useWebSocket (below)
            if (chainData.wsUrl) {
                return;
            }
            // Grab block right away, then poll on periotic basis
            await pollBlockNum();

            const interval = setInterval(async () => {
                await pollBlockNum();
            }, BLOCK_NUM_POLL_MS);
            return () => clearInterval(interval);
        })();
    }, [chainData.nodeUrl, BLOCK_NUM_POLL_MS]);

    /* This will not work with RPCs that don't support web socket subscriptions. In
     * particular Infura does not support websockets on Arbitrum endpoints. */
    const { sendMessage: sendBlockHeaderSub, lastMessage: lastNewHeadMessage } =
        useWebSocket(chainData.wsUrl || null, {
            onOpen: () => {
                sendBlockHeaderSub(
                    '{"jsonrpc":"2.0","method":"eth_subscribe","params":["newHeads"],"id":5}',
                );
            },
            onClose: (event: CloseEvent) => {
                if (IS_LOCAL_ENV) {
                    false &&
                        console.debug('infura newHeads subscription closed');
                    false && console.debug({ event });
                }
            },
            shouldReconnect: () => shouldNonCandleSubscriptionsReconnect,
        });

    useEffect(() => {
        if (lastNewHeadMessage && lastNewHeadMessage.data) {
            const lastMessageData = JSON.parse(lastNewHeadMessage.data);
            if (lastMessageData) {
                const lastBlockNumberHex =
                    lastMessageData.params?.result?.number;
                if (lastBlockNumberHex) {
                    const newBlockNum = parseInt(lastBlockNumberHex);
                    if (lastBlockNumber !== newBlockNum) {
                        setLastBlockNumber(parseInt(lastBlockNumberHex));
                        dispatch(setLastBlock(parseInt(lastBlockNumberHex)));
                    }
                }
            }
        }
    }, [lastNewHeadMessage]);

    const [mainnetProvider, setMainnetProvider] = useState<
        Provider | undefined
    >();

    useEffect(() => {
        const infuraKey2 = process.env.REACT_APP_INFURA_KEY_2
            ? process.env.REACT_APP_INFURA_KEY_2
            : '360ea5fda45b4a22883de8522ebd639e'; // croc labs #2

        const mainnetProvider = new ethers.providers.JsonRpcProvider(
            'https://mainnet.infura.io/v3/' + infuraKey2, // croc labs #2
        );
        IS_LOCAL_ENV && console.debug({ mainnetProvider });
        setMainnetProvider(mainnetProvider);
    }, []);

    const isPairStable = useMemo(
        () =>
            isStablePair(
                tradeData.tokenA.address,
                tradeData.tokenB.address,
                chainData.chainId,
            ),
        [tradeData.tokenA.address, tradeData.tokenB.address, chainData.chainId],
    );

    const [sidebarManuallySet, setSidebarManuallySet] =
        useState<boolean>(false);
    const [showSidebar, setShowSidebar] = useState<boolean>(false);

    const [lastBlockNumber, setLastBlockNumber] = useState<number>(0);

    const receiptData = useAppSelector((state) => state.receiptData);

    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

    const sessionReceipts = receiptData?.sessionReceipts;

    const lastReceipt =
        sessionReceipts.length > 0 ? JSON.parse(sessionReceipts[0]) : null;

    const isLastReceiptSuccess = lastReceipt?.status === 1;

    const snackMessage = lastReceipt
        ? isLastReceiptSuccess
            ? `Transaction ${lastReceipt.transactionHash} successfully completed`
            : `Transaction ${lastReceipt.transactionHash} failed`
        : '';

    const snackbarContent = (
        <SnackbarComponent
            severity={isLastReceiptSuccess ? 'info' : 'warning'}
            setOpenSnackbar={setOpenSnackbar}
            openSnackbar={openSnackbar}
        >
            {snackMessage}
        </SnackbarComponent>
    );

    const lastReceiptHash = useMemo(
        () => (lastReceipt ? sum(lastReceipt) : undefined),
        [lastReceipt],
    );
    useEffect(() => {
        if (lastReceiptHash) {
            IS_LOCAL_ENV && console.debug('new receipt to display');
            setOpenSnackbar(true);
        }
    }, [lastReceiptHash]);

    const ensName = userData.ensNameCurrent || '';

    // check for ENS name account changes
    useEffect(() => {
        (async () => {
            if (isUserLoggedIn && account && provider) {
                IS_LOCAL_ENV && console.debug('checking for ens name');
                try {
                    const ensName = await cachedFetchAddress(
                        provider,
                        account,
                        chainData.chainId,
                    );
                    if (ensName) {
                        // setEnsName(ensName);
                        dispatch(setEnsNameCurrent(ensName));
                        if (ensName.length > 15) {
                            dispatch(
                                setEnsOrAddressTruncated(
                                    trimString(ensName, 10, 3, '…'),
                                ),
                            );
                        } else {
                            dispatch(setEnsOrAddressTruncated(ensName));
                        }
                    } else {
                        dispatch(setEnsNameCurrent(undefined));
                        // setEnsName('');

                        dispatch(
                            setEnsOrAddressTruncated(
                                trimString(account, 5, 3, '…'),
                            ),
                        );
                    }
                } catch (error) {
                    dispatch(setEnsNameCurrent(undefined));
                    // setEnsName('');
                    dispatch(
                        setEnsOrAddressTruncated(
                            trimString(account, 5, 3, '…'),
                        ),
                    );
                }
            } else if (!isUserLoggedIn || !account) {
                dispatch(setEnsOrAddressTruncated(undefined));
            }
        })();
    }, [isUserLoggedIn, account, chainData.chainId]);

    // const everySecondBlock = useMemo(() => Math.floor(lastBlockNumber / 2), [lastBlockNumber]);
    const everyEigthBlock = useMemo(
        () => Math.floor(lastBlockNumber / 8),
        [lastBlockNumber],
    );
    // check for token balances every eight blocks

    // Fetch liquidity every minute
    const fetchLiquidity = async () => {
        if (
            !baseTokenAddress ||
            !quoteTokenAddress ||
            !chainData ||
            !lastBlockNumber
        )
            return;
        cachedLiquidityQuery(
            chainData.chainId,
            baseTokenAddress.toLowerCase(),
            quoteTokenAddress.toLowerCase(),
            chainData.poolIndex,
            Math.floor(Date.now() / LIQUIDITY_FETCH_PERIOD_MS),
        )
            .then((jsonData) => {
                dispatch(setLiquidity(jsonData));
            })
            .catch(console.error);
    };

    // Runs nyquist of our 1 minute caching function.
    useEffect(() => {
        const id = setInterval(() => {
            fetchLiquidity();
        }, LIQUIDITY_FETCH_PERIOD_MS / 2);
        return () => clearInterval(id);
    }, []);

    const addTokenInfo = (token: TokenIF): TokenIF => {
        const newToken = { ...token };
        const tokenAddress = token.address;
        const key =
            tokenAddress.toLowerCase() + '_0x' + token.chainId.toString(16);

        const tokenName = tokensOnActiveLists.get(key)?.name;

        const tokenLogoURI = tokensOnActiveLists.get(key)?.logoURI;

        newToken.name = tokenName ?? '';

        newToken.logoURI = tokenLogoURI ?? '';

        return newToken;
    };

    useEffect(() => {
        (async () => {
            IS_LOCAL_ENV &&
                console.debug('fetching native token and erc20 token balances');
            if (crocEnv && isUserLoggedIn && account && chainData.chainId) {
                try {
                    const newNativeToken: TokenIF =
                        await cachedFetchNativeTokenBalance(
                            account,
                            chainData.chainId,
                            everyEigthBlock,
                            crocEnv,
                        );

                    dispatch(setNativeToken(newNativeToken));
                } catch (error) {
                    console.error({ error });
                }
                try {
                    const erc20Results: TokenIF[] =
                        await cachedFetchErc20TokenBalances(
                            account,
                            chainData.chainId,
                            everyEigthBlock,
                            crocEnv,
                        );
                    const erc20TokensWithLogos = erc20Results.map((token) =>
                        addTokenInfo(token),
                    );

                    dispatch(setErc20Tokens(erc20TokensWithLogos));
                } catch (error) {
                    console.error({ error });
                }
            }
        })();
    }, [crocEnv, isUserLoggedIn, account, chainData.chainId, everyEigthBlock]);

    const [baseTokenAddress, setBaseTokenAddress] = useState<string>('');
    const [quoteTokenAddress, setQuoteTokenAddress] = useState<string>('');

    const [mainnetBaseTokenAddress, setMainnetBaseTokenAddress] =
        useState<string>('');
    const [mainnetQuoteTokenAddress, setMainnetQuoteTokenAddress] =
        useState<string>('');

    const [baseTokenDecimals, setBaseTokenDecimals] = useState<number>(0);
    const [quoteTokenDecimals, setQuoteTokenDecimals] = useState<number>(0);

    const [isTokenABase, setIsTokenABase] = useState<boolean>(false);

    const [ambientApy, setAmbientApy] = useState<number | undefined>();
    const [dailyVol, setDailyVol] = useState<number | undefined>();

    // TODO:  @Emily useMemo() this value
    const tokenPair = {
        dataTokenA: tradeData.tokenA,
        dataTokenB: tradeData.tokenB,
    };

    const pool = useMemo(
        () =>
            crocEnv?.pool(
                tradeData.baseToken.address,
                tradeData.quoteToken.address,
            ),
        [crocEnv, tradeData.baseToken.address, tradeData.quoteToken.address],
    );

    // value for whether a pool exists on current chain and token pair
    // ... true => pool exists
    // ... false => pool does not exist
    // ... null => no crocEnv to check if pool exists
    const [poolExists, setPoolExists] = useState<boolean | undefined>();

    // hook to update `poolExists` when crocEnv changes
    useEffect(() => {
        if (crocEnv && baseTokenAddress && quoteTokenAddress) {
            IS_LOCAL_ENV && console.debug('checking if pool exists');
            if (
                baseTokenAddress.toLowerCase() ===
                quoteTokenAddress.toLowerCase()
            )
                return;
            // token pair has an initialized pool on-chain
            // returns a promise object
            const doesPoolExist = crocEnv
                // TODO: make this function pill addresses directly from URL params
                .pool(baseTokenAddress, quoteTokenAddress)
                .isInit();
            // resolve the promise object to see if pool exists
            Promise.resolve(doesPoolExist)
                // track whether pool exists on state (can be undefined)
                .then((res) => setPoolExists(res));
        }
        // run every time crocEnv updates
        // this indirectly tracks a new chain being used
    }, [
        crocEnv,
        baseTokenAddress,
        quoteTokenAddress,
        chainData.chainId,
        sessionReceipts.length,
    ]);

    const [resetLimitTick, setResetLimitTick] = useState(false);
    useEffect(() => {
        if (resetLimitTick) {
            IS_LOCAL_ENV && console.debug('resetting limit tick');
            dispatch(setPoolPriceNonDisplay(0));

            dispatch(setLimitTick(undefined));
        }
    }, [resetLimitTick]);

    useEffect(() => {
        if (!location.pathname.includes('limitTick')) {
            dispatch(setLimitTick(undefined));
        }
        dispatch(setPrimaryQuantityRange(''));
        setPoolPriceDisplay(undefined);
        dispatch(setDidUserFlipDenom(false)); // reset so a new token pair is re-evaluated for price > 1
    }, [baseTokenAddress + quoteTokenAddress]);

    useEffect(() => {
        (async () => {
            if (isServerEnabled && baseTokenAddress && quoteTokenAddress) {
                const poolAmbientApyCacheEndpoint =
                    'https://809821320828123.de:5000' +
                    '/pool_ambient_apy_cached?';

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

                        const tickVol = json?.data?.tickStdev;
                        const dailyVol = tickVol ? tickVol / 10000 : undefined;
                        setDailyVol(dailyVol);
                    });
            }
        })();
    }, [isServerEnabled, baseTokenAddress + quoteTokenAddress]);

    const resetAdvancedTicksIfNotCopy = () => {
        if (!ticksInParams) {
            dispatch(setAdvancedLowTick(0));
            dispatch(setAdvancedHighTick(0));
            dispatch(setAdvancedMode(false));
            setSimpleRangeWidth(10);
            const sliderInput = document.getElementById(
                'input-slider-range',
            ) as HTMLInputElement;
            if (sliderInput) sliderInput.value = '10';
        }
    };
    // useEffect that runs when token pair changes
    useEffect(() => {
        if (rtkMatchesParams && crocEnv) {
            // reset rtk values for user specified range in ticks
            IS_LOCAL_ENV && console.debug('resetting advanced ticks');

            // reset advanced ticks if token pair change not the result of a 'copy trade'
            resetAdvancedTicksIfNotCopy();

            const tokenAAddress = tokenPair?.dataTokenA?.address;
            const tokenBAddress = tokenPair?.dataTokenB?.address;

            if (tokenAAddress && tokenBAddress) {
                const sortedTokens = sortBaseQuoteTokens(
                    tokenAAddress,
                    tokenBAddress,
                );
                const tokenAMainnetEquivalent =
                    tokenAAddress === ZERO_ADDRESS
                        ? tokenAAddress
                        : testTokenMap
                              .get(
                                  tokenAAddress.toLowerCase() +
                                      '_' +
                                      chainData.chainId,
                              )
                              ?.split('_')[0];
                const tokenBMainnetEquivalent =
                    tokenBAddress === ZERO_ADDRESS
                        ? tokenBAddress
                        : testTokenMap
                              .get(
                                  tokenBAddress.toLowerCase() +
                                      '_' +
                                      chainData.chainId,
                              )
                              ?.split('_')[0];

                if (tokenAMainnetEquivalent && tokenBMainnetEquivalent) {
                    const sortedMainnetTokens = sortBaseQuoteTokens(
                        tokenAMainnetEquivalent,
                        tokenBMainnetEquivalent,
                    );

                    setMainnetBaseTokenAddress(sortedMainnetTokens[0]);
                    setMainnetQuoteTokenAddress(sortedMainnetTokens[1]);

                    dispatch(
                        setMainnetBaseTokenReduxAddress(sortedMainnetTokens[0]),
                    );
                    dispatch(
                        setMainnetQuoteTokenReduxAddress(
                            sortedMainnetTokens[1],
                        ),
                    );
                } else {
                    setMainnetBaseTokenAddress('');
                    setMainnetQuoteTokenAddress('');
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

                // retrieve pool liquidity provider fee

                if (isServerEnabled && httpGraphCacheServerDomain) {
                    getLiquidityFee(
                        sortedTokens[0],
                        sortedTokens[1],
                        chainData.poolIndex,
                        chainData.chainId,
                    )
                        .then((liquidityFeeNum) => {
                            if (liquidityFeeNum)
                                dispatch(setLiquidityFee(liquidityFeeNum));
                        })
                        .catch(console.error);

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
                        .catch(console.error);

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
                                                    poolIdx:
                                                        volumeSeries.poolIdx,
                                                    chainId: chainData.chainId,
                                                },
                                                volumeData: volumeSeries,
                                            },
                                        ],
                                    }),
                                );
                        })
                        .catch(console.error);

                    // retrieve pool liquidity

                    // const poolLiquidityCacheEndpoint =
                    //     httpGraphCacheServerDomain + '/pool_liquidity_distribution?';

                    cachedLiquidityQuery(
                        chainData.chainId,
                        sortedTokens[0].toLowerCase(),
                        sortedTokens[1].toLowerCase(),
                        chainData.poolIndex,
                        lastBlockNumber,
                    )
                        .then((jsonData) => {
                            dispatch(setLiquidity(jsonData));
                        })
                        .catch(console.error);

                    // retrieve pool_positions
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
                                n: '50',
                            }),
                    )
                        .then((response) => response.json())
                        .then((json) => {
                            const poolPositions = json.data;
                            dispatch(
                                setDataLoadingStatus({
                                    datasetName: 'poolRangeData',
                                    loadingStatus: false,
                                }),
                            );

                            if (poolPositions && crocEnv) {
                                Promise.all(
                                    poolPositions.map(
                                        (position: PositionIF) => {
                                            return getPositionData(
                                                position,
                                                searchableTokens,
                                                crocEnv,
                                                chainData.chainId,
                                                lastBlockNumber,
                                            );
                                        },
                                    ),
                                )
                                    .then((updatedPositions) => {
                                        if (
                                            sum(
                                                graphData.positionsByUser
                                                    .positions,
                                            ) !== sum(updatedPositions)
                                        ) {
                                            dispatch(
                                                setPositionsByPool({
                                                    dataReceived: true,
                                                    positions: updatedPositions,
                                                }),
                                            );
                                        }
                                    })
                                    .catch(console.error);
                            }
                        })
                        .catch(console.error);

                    // retrieve positions for leaderboard
                    const poolPositionsCacheEndpoint =
                        httpGraphCacheServerDomain +
                        '/annotated_pool_positions?';
                    fetch(
                        poolPositionsCacheEndpoint +
                            new URLSearchParams({
                                base: sortedTokens[0].toLowerCase(),
                                quote: sortedTokens[1].toLowerCase(),
                                poolIdx: chainData.poolIndex.toString(),
                                chainId: chainData.chainId,
                                ensResolution: 'true',
                                omitEmpty: 'true',
                                omitKnockout: 'true',
                                addValue: 'true',
                                sortByAPY: 'true',
                                n: '50',
                                minPosAge: '86400', // restrict leaderboard to position > 1 day old
                            }),
                    )
                        .then((response) => response.json())
                        .then((json) => {
                            const leaderboardPositions = json.data;

                            if (leaderboardPositions && crocEnv) {
                                Promise.all(
                                    leaderboardPositions.map(
                                        (position: PositionIF) => {
                                            return getPositionData(
                                                position,
                                                searchableTokens,
                                                crocEnv,
                                                chainData.chainId,
                                                lastBlockNumber,
                                            );
                                        },
                                    ),
                                )
                                    .then((updatedPositions) => {
                                        const top10Positions = updatedPositions
                                            .filter(
                                                (
                                                    updatedPosition: PositionIF,
                                                ) => {
                                                    return (
                                                        updatedPosition.isPositionInRange &&
                                                        updatedPosition.apy !==
                                                            0
                                                    );
                                                },
                                            )
                                            .slice(0, 10);
                                        if (
                                            sum(
                                                graphData.leaderboardByPool
                                                    .positions,
                                            ) !== sum(top10Positions)
                                        ) {
                                            dispatch(
                                                setLeaderboardByPool({
                                                    dataReceived: true,
                                                    positions: top10Positions,
                                                }),
                                            );
                                        }
                                    })
                                    .catch(console.error);
                            }
                        })
                        .catch(console.error);

                    // retrieve pool recent changes
                    fetchPoolRecentChanges({
                        tokenList: searchableTokens,
                        base: sortedTokens[0],
                        quote: sortedTokens[1],
                        poolIdx: chainData.poolIndex,
                        chainId: chainData.chainId,
                        annotate: true,
                        addValue: true,
                        simpleCalc: true,
                        annotateMEV: false,
                        ensResolution: true,
                        n: 80,
                    })
                        .then((poolChangesJsonData) => {
                            if (poolChangesJsonData) {
                                dispatch(
                                    setDataLoadingStatus({
                                        datasetName: 'poolTxData',
                                        loadingStatus: false,
                                    }),
                                );
                                dispatch(
                                    setChangesByPool({
                                        dataReceived: true,
                                        changes: poolChangesJsonData,
                                    }),
                                );
                            }
                        })
                        .catch(console.error);

                    // retrieve pool limit order states

                    const poolLimitOrderStatesCacheEndpoint =
                        httpGraphCacheServerDomain +
                        '/pool_limit_order_states?';

                    fetch(
                        poolLimitOrderStatesCacheEndpoint +
                            new URLSearchParams({
                                base: sortedTokens[0].toLowerCase(),
                                quote: sortedTokens[1].toLowerCase(),
                                poolIdx: chainData.poolIndex.toString(),
                                chainId: chainData.chainId,
                                ensResolution: 'true',
                                omitEmpty: 'true',
                                n: '50',
                                // n: 10 // positive integer	(Optional.) If n and page are provided, query returns a page of results with at most n entries.
                                // page: 0 // nonnegative integer	(Optional.) If n and page are provided, query returns the page-th page of results. Page numbers are 0-indexed.
                            }),
                    )
                        .then((response) => response?.json())
                        .then((json) => {
                            const poolLimitOrderStates = json?.data;

                            dispatch(
                                setDataLoadingStatus({
                                    datasetName: 'poolOrderData',
                                    loadingStatus: false,
                                }),
                            );

                            if (poolLimitOrderStates) {
                                Promise.all(
                                    poolLimitOrderStates.map(
                                        (limitOrder: LimitOrderIF) => {
                                            return getLimitOrderData(
                                                limitOrder,
                                                searchableTokens,
                                            );
                                        },
                                    ),
                                ).then((updatedLimitOrderStates) => {
                                    dispatch(
                                        setLimitOrdersByPool({
                                            dataReceived: true,
                                            limitOrders:
                                                updatedLimitOrderStates,
                                        }),
                                    );
                                });
                            }
                        })
                        .catch(console.error);
                }
            }
        }
    }, [
        searchableTokens.length,
        rtkMatchesParams,
        baseTokenAddress + quoteTokenAddress,
        chainData.chainId,
        crocEnv,
    ]);

    // local logic to determine current chart period
    // this is situation-dependant but used in this file
    let candleTimeLocal: number;
    if (
        location.pathname.startsWith('/trade/range') ||
        location.pathname.startsWith('/trade/reposition')
    ) {
        candleTimeLocal = chartSettings.candleTime.range.time;
    } else {
        candleTimeLocal = chartSettings.candleTime.market.time;
    }

    useEffect(() => {
        setCandleData(undefined);
        setIsCandleDataNull(false);
        setExpandTradeTable(false);
        fetchCandles();
    }, [mainnetBaseTokenAddress, mainnetQuoteTokenAddress, candleTimeLocal]);

    const fetchCandles = () => {
        if (
            isServerEnabled &&
            baseTokenAddress &&
            quoteTokenAddress &&
            mainnetBaseTokenAddress &&
            mainnetQuoteTokenAddress &&
            candleTimeLocal
        ) {
            IS_LOCAL_ENV && console.debug('fetching new candles');
            try {
                if (httpGraphCacheServerDomain) {
                    const candleSeriesCacheEndpoint =
                        httpGraphCacheServerDomain + '/candle_series?';
                    setFetchingCandle(true);
                    fetch(
                        candleSeriesCacheEndpoint +
                            new URLSearchParams({
                                base: mainnetBaseTokenAddress.toLowerCase(),
                                quote: mainnetQuoteTokenAddress.toLowerCase(),
                                poolIdx: chainData.poolIndex.toString(),
                                period: candleTimeLocal.toString(),
                                // time: '1657833300', // optional
                                n: '200', // positive integer
                                // page: '0', // nonnegative integer
                                chainId: mktDataChainId(chainData.chainId),
                                dex: 'all',
                                poolStats: 'true',
                                concise: 'true',
                                poolStatsChainIdOverride: chainData.chainId,
                                poolStatsBaseOverride:
                                    baseTokenAddress.toLowerCase(),
                                poolStatsQuoteOverride:
                                    quoteTokenAddress.toLowerCase(),
                                poolStatsPoolIdxOverride:
                                    chainData.poolIndex.toString(),
                            }),
                    )
                        .then((response) => response?.json())
                        .then((json) => {
                            const candles = json?.data;
                            if (candles?.length === 0) {
                                setIsCandleDataNull(true);
                                setExpandTradeTable(true);
                            } else if (candles) {
                                if (sum(candleData) !== sum(candles)) {
                                    setCandleData({
                                        pool: {
                                            baseAddress:
                                                baseTokenAddress.toLowerCase(),
                                            quoteAddress:
                                                quoteTokenAddress.toLowerCase(),
                                            poolIdx: chainData.poolIndex,
                                            network: chainData.chainId,
                                        },
                                        duration: candleTimeLocal,
                                        candles: candles,
                                    });
                                }
                            }
                        })
                        .catch(console.error);
                }
            } catch (error) {
                console.error({ error });
            }
        } else {
            setIsCandleDataNull(true);
            setExpandTradeTable(true);
        }
    };

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
            // onOpen: () => console.debug('pool liqChange subscription opened'),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // onClose: (event: any) => console.debug({ event }),
            // onClose: () => console.debug('allPositions websocket connection closed'),
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => shouldNonCandleSubscriptionsReconnect,
        },
        // only connect if base/quote token addresses are available
        isServerEnabled && baseTokenAddress !== '' && quoteTokenAddress !== '',
    );

    useEffect(() => {
        if (lastPoolLiqChangeMessage !== null) {
            IS_LOCAL_ENV &&
                console.debug('new pool liq change message received');
            const lastMessageData = JSON.parse(
                lastPoolLiqChangeMessage.data,
            ).data;
            if (lastMessageData && crocEnv) {
                Promise.all(
                    lastMessageData.map((position: PositionIF) => {
                        return getPositionData(
                            position,
                            searchableTokens,
                            crocEnv,
                            chainData.chainId,
                            lastBlockNumber,
                        );
                    }),
                ).then((updatedPositions) => {
                    dispatch(addPositionsByPool(updatedPositions));
                });
            }
        }
    }, [lastPoolLiqChangeMessage]);

    const poolRecentChangesCacheSubscriptionEndpoint = useMemo(
        () =>
            wssGraphCacheServerDomain +
            '/subscribe_pool_recent_changes?' +
            new URLSearchParams({
                base: baseTokenAddress.toLowerCase(),
                quote: quoteTokenAddress.toLowerCase(),
                poolIdx: chainData.poolIndex.toString(),
                chainId: chainData.chainId,
                ensResolution: 'true',
                annotate: 'true',
                addValue: 'true',
            }),
        [
            baseTokenAddress,
            quoteTokenAddress,
            chainData.chainId,
            chainData.poolIndex,
        ],
    );

    const { lastMessage: lastPoolChangeMessage } = useWebSocket(
        poolRecentChangesCacheSubscriptionEndpoint,
        {
            // share:  true,
            onOpen: () => {
                IS_LOCAL_ENV &&
                    console.debug('pool recent changes subscription opened');
            },
            onClose: (event: CloseEvent) => {
                IS_LOCAL_ENV && console.debug({ event });
            },
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => true,
        },
        // only connect if base/quote token addresses are available
        isServerEnabled && baseTokenAddress !== '' && quoteTokenAddress !== '',
    );

    useEffect(() => {
        if (lastPoolChangeMessage !== null) {
            const lastMessageData = JSON.parse(lastPoolChangeMessage.data).data;
            if (lastMessageData) {
                Promise.all(
                    lastMessageData.map((tx: TransactionIF) => {
                        return getTransactionData(tx, searchableTokens);
                    }),
                )
                    .then((updatedTransactions) => {
                        dispatch(addChangesByPool(updatedTransactions));
                    })
                    .catch(console.error);
            }
        }
    }, [lastPoolChangeMessage]);

    useEffect(() => {
        if (lastPoolChangeMessage !== null) {
            const lastMessageData = JSON.parse(lastPoolChangeMessage.data).data;
            if (lastMessageData) {
                IS_LOCAL_ENV && console.debug({ lastMessageData });
                Promise.all(
                    lastMessageData.map((limitOrder: LimitOrderIF) => {
                        return getLimitOrderData(limitOrder, searchableTokens);
                    }),
                ).then((updatedLimitOrderStates) => {
                    dispatch(
                        addLimitOrderChangesByPool(updatedLimitOrderStates),
                    );
                });
            }
        }
    }, [lastPoolChangeMessage]);

    const candleSubscriptionEndpoint = useMemo(
        () =>
            wssGraphCacheServerDomain +
            '/subscribe_candles?' +
            new URLSearchParams({
                base: mainnetBaseTokenAddress.toLowerCase(),
                quote: mainnetQuoteTokenAddress.toLowerCase(),
                poolIdx: chainData.poolIndex.toString(),
                period: candleTimeLocal.toString(),
                chainId: mktDataChainId(chainData.chainId),
                dex: 'all',
                poolStats: 'true',
                concise: 'true',
                poolStatsChainIdOverride: chainData.chainId,
                poolStatsBaseOverride: baseTokenAddress.toLowerCase(),
                poolStatsQuoteOverride: quoteTokenAddress.toLowerCase(),
                poolStatsPoolIdxOverride: chainData.poolIndex.toString(),
            }),
        [
            mainnetBaseTokenAddress,
            mainnetQuoteTokenAddress,
            chainData.chainId,
            chainData.poolIndex,
            candleTimeLocal,
        ],
    );

    const { lastMessage: candlesMessage } = useWebSocket(
        candleSubscriptionEndpoint,
        {
            onClose: (event) => {
                IS_LOCAL_ENV && console.debug({ event });
            },
            shouldReconnect: () => shouldCandleSubscriptionsReconnect,
        },
        // only connect if base/quote token addresses are available
        isServerEnabled &&
            mainnetBaseTokenAddress !== '' &&
            mainnetQuoteTokenAddress !== '',
    );

    const [candleDomains, setCandleDomains] = useState<candleDomain>({
        lastCandleDate: undefined,
        domainBoundry: undefined,
    });

    const domainBoundaryInSeconds = Math.floor(
        (candleDomains?.domainBoundry || 0) / 1000,
    );

    const domainBoundaryInSecondsDebounced = useDebounce(
        domainBoundaryInSeconds,
        500,
    );

    const minTimeMemo = useMemo(() => {
        const candleDataLength = candleData?.candles?.length;
        if (!candleDataLength) return;
        IS_LOCAL_ENV && console.debug({ candleDataLength });
        return candleData.candles.reduce((prev, curr) =>
            prev.time < curr.time ? prev : curr,
        )?.time;
    }, [candleData?.candles?.length]);

    const numDurationsNeeded = useMemo(() => {
        if (!minTimeMemo || !domainBoundaryInSecondsDebounced) return;
        return Math.floor(
            (minTimeMemo - domainBoundaryInSecondsDebounced) / candleTimeLocal,
        );
    }, [minTimeMemo, domainBoundaryInSecondsDebounced]);

    const candleSeriesCacheEndpoint =
        httpGraphCacheServerDomain + '/candle_series?';

    const fetchCandlesByNumDurations = (numDurations: number) =>
        fetch(
            candleSeriesCacheEndpoint +
                new URLSearchParams({
                    base: mainnetBaseTokenAddress.toLowerCase(),
                    quote: mainnetQuoteTokenAddress.toLowerCase(),
                    poolIdx: chainData.poolIndex.toString(),
                    period: candleTimeLocal.toString(),
                    time: minTimeMemo ? minTimeMemo.toString() : '0',
                    // time: debouncedBoundary.toString(),
                    n: numDurations.toString(), // positive integer
                    // page: '0', // nonnegative integer
                    chainId: mktDataChainId(chainData.chainId),
                    dex: 'all',
                    poolStats: 'true',
                    concise: 'true',
                    poolStatsChainIdOverride: chainData.chainId,
                    poolStatsBaseOverride: baseTokenAddress.toLowerCase(),
                    poolStatsQuoteOverride: quoteTokenAddress.toLowerCase(),
                    poolStatsPoolIdxOverride: chainData.poolIndex.toString(),
                }),
        )
            .then((response) => response?.json())
            .then((json) => {
                const fetchedCandles = json?.data;
                if (fetchedCandles && candleData) {
                    const newCandles: CandleData[] = [];
                    const updatedCandles: CandleData[] = candleData.candles;

                    for (
                        let index = 0;
                        index < fetchedCandles.length;
                        index++
                    ) {
                        const messageCandle = fetchedCandles[index];
                        const indexOfExistingCandle =
                            candleData.candles.findIndex(
                                (savedCandle) =>
                                    savedCandle.time === messageCandle.time,
                            );

                        if (indexOfExistingCandle === -1) {
                            newCandles.push(messageCandle);
                        } else if (
                            sum(candleData.candles[indexOfExistingCandle]) !==
                            sum(messageCandle)
                        ) {
                            updatedCandles[indexOfExistingCandle] =
                                messageCandle;
                        }
                    }
                    const newCandleData: CandlesByPoolAndDuration = {
                        pool: candleData.pool,
                        duration: candleData.duration,
                        candles: newCandles.concat(updatedCandles),
                    };
                    setCandleData(newCandleData);
                }
            })
            .catch(console.error);

    useEffect(() => {
        if (!numDurationsNeeded) return;
        if (numDurationsNeeded > 0 && numDurationsNeeded < 1000) {
            IS_LOCAL_ENV &&
                console.debug(`fetching ${numDurationsNeeded} new candles`);
            fetchCandlesByNumDurations(numDurationsNeeded);
        }
    }, [numDurationsNeeded]);

    useEffect(() => {
        if (candlesMessage) {
            const lastMessageData = JSON.parse(candlesMessage.data).data;
            if (lastMessageData && candleData) {
                const newCandles: CandleData[] = [];
                const updatedCandles: CandleData[] = candleData.candles;

                for (let index = 0; index < lastMessageData.length; index++) {
                    const messageCandle = lastMessageData[index];
                    const indexOfExistingCandle = candleData.candles.findIndex(
                        (savedCandle) =>
                            savedCandle.time === messageCandle.time,
                    );

                    if (indexOfExistingCandle === -1) {
                        IS_LOCAL_ENV &&
                            console.debug('pushing new candle from message');
                        newCandles.push(messageCandle);
                    } else if (
                        sum(candleData.candles[indexOfExistingCandle]) !==
                        sum(messageCandle)
                    ) {
                        updatedCandles[indexOfExistingCandle] = messageCandle;
                    }
                }
                const newCandleData: CandlesByPoolAndDuration = {
                    pool: candleData.pool,
                    duration: candleData.duration,
                    candles: newCandles.concat(updatedCandles),
                };
                setCandleData(newCandleData);
            }
        }
    }, [candlesMessage]);

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
            onOpen: () => {
                IS_LOCAL_ENV &&
                    console.debug('user liqChange subscription opened');
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClose: (event: any) => {
                IS_LOCAL_ENV && console.debug({ event });
            },
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => shouldNonCandleSubscriptionsReconnect,
        },
        // only connect is account is available
        isServerEnabled && account !== null && account !== undefined,
    );

    useEffect(() => {
        if (lastUserPositionsMessage !== null) {
            const lastMessageData = JSON.parse(
                lastUserPositionsMessage.data,
            ).data;
            if (lastMessageData && crocEnv) {
                IS_LOCAL_ENV &&
                    console.debug('new user position message received');
                Promise.all(
                    lastMessageData.map((position: PositionIF) => {
                        return getPositionData(
                            position,
                            searchableTokens,
                            crocEnv,
                            chainData.chainId,
                            lastBlockNumber,
                        );
                    }),
                ).then((updatedPositions) => {
                    dispatch(addPositionsByUser(updatedPositions));
                });
            }
        }
    }, [lastUserPositionsMessage]);

    const userRecentChangesCacheSubscriptionEndpoint = useMemo(
        () =>
            wssGraphCacheServerDomain +
            '/subscribe_user_recent_changes?' +
            new URLSearchParams({
                user: account || '',
                chainId: chainData.chainId,
                addValue: 'true',
                annotate: 'true',
                ensResolution: 'true',
            }),
        [account, chainData.chainId],
    );

    const { lastMessage: lastUserRecentChangesMessage } = useWebSocket(
        userRecentChangesCacheSubscriptionEndpoint,
        {
            // share: true,
            onOpen: () => {
                IS_LOCAL_ENV &&
                    console.debug('user recent changes subscription opened');
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClose: (event: any) => {
                IS_LOCAL_ENV && console.debug({ event });
            },
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => shouldNonCandleSubscriptionsReconnect,
        },
        // only connect is account is available
        isServerEnabled && account !== null && account !== undefined,
    );

    useEffect(() => {
        if (lastUserRecentChangesMessage !== null) {
            IS_LOCAL_ENV && console.debug('received new user recent change');
            const lastMessageData = JSON.parse(
                lastUserRecentChangesMessage.data,
            ).data;

            if (lastMessageData) {
                Promise.all(
                    lastMessageData.map((tx: TransactionIF) => {
                        return getTransactionData(tx, searchableTokens);
                    }),
                )
                    .then((updatedTransactions) => {
                        dispatch(addChangesByUser(updatedTransactions));
                    })
                    .catch(console.error);
            }
        }
    }, [lastUserRecentChangesMessage]);

    const userLimitOrderChangesCacheSubscriptionEndpoint = useMemo(
        () =>
            wssGraphCacheServerDomain +
            '/subscribe_user_limit_order_changes?' +
            new URLSearchParams({
                user: account || '',
                chainId: chainData.chainId,
                addValue: 'true',
                ensResolution: 'true',
            }),
        [account, chainData.chainId],
    );

    const { lastMessage: lastUserLimitOrderChangesMessage } = useWebSocket(
        userLimitOrderChangesCacheSubscriptionEndpoint,
        {
            // share: true,
            onOpen: () => {
                IS_LOCAL_ENV &&
                    console.debug(
                        'user limit order changes subscription opened',
                    );
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClose: (event: any) => {
                IS_LOCAL_ENV && console.debug({ event });
            },
            // Will attempt to reconnect on all close events, such as server shutting down
            shouldReconnect: () => shouldNonCandleSubscriptionsReconnect,
        },
        // only connect is account is available
        isServerEnabled && account !== null && account !== undefined,
    );

    useEffect(() => {
        if (lastUserLimitOrderChangesMessage !== null) {
            const lastMessageData = JSON.parse(
                lastUserLimitOrderChangesMessage.data,
            ).data;

            if (lastMessageData) {
                IS_LOCAL_ENV &&
                    console.debug('received new user limit order change');
                Promise.all(
                    lastMessageData.map((limitOrder: LimitOrderIF) => {
                        return getLimitOrderData(limitOrder, searchableTokens);
                    }),
                ).then((updatedLimitOrderStates) => {
                    dispatch(
                        addLimitOrderChangesByUser(updatedLimitOrderStates),
                    );
                });
            }
        }
    }, [lastUserLimitOrderChangesMessage]);

    const [baseTokenBalance, setBaseTokenBalance] = useState<string>('');
    const [quoteTokenBalance, setQuoteTokenBalance] = useState<string>('');
    const [baseTokenDexBalance, setBaseTokenDexBalance] = useState<string>('');
    const [quoteTokenDexBalance, setQuoteTokenDexBalance] =
        useState<string>('');

    // const [poolPriceTick, setPoolPriceTick] = useState<number | undefined>();
    // const [poolPriceNonDisplay, setPoolPriceNonDisplay] = useState<number | undefined>();
    const [poolPriceDisplay, setPoolPriceDisplay] = useState<
        number | undefined
    >();

    const poolPriceNonDisplay = tradeData.poolPriceNonDisplay;

    useEffect(() => {
        IS_LOCAL_ENV &&
            console.debug('resetting pool price because base/quote changed');
        setPoolPriceDisplay(0);
        // setPoolPriceTick(undefined);
    }, [baseTokenAddress + quoteTokenAddress]);

    const getDisplayPrice = (spotPrice: number) => {
        return toDisplayPrice(spotPrice, baseTokenDecimals, quoteTokenDecimals);
    };

    const getSpotPrice = async (
        baseTokenAddress: string,
        quoteTokenAddress: string,
    ) => {
        if (!crocEnv) {
            return;
        }
        return await cachedQuerySpotPrice(
            crocEnv,
            baseTokenAddress,
            quoteTokenAddress,
            chainData.chainId,
            lastBlockNumber,
        );
    };

    // useEffect to get spot price when tokens change and block updates
    useEffect(() => {
        if (
            !isUserIdle &&
            crocEnv &&
            baseTokenAddress &&
            quoteTokenAddress &&
            lastBlockNumber !== 0
        ) {
            (async () => {
                const spotPrice = await getSpotPrice(
                    baseTokenAddress,
                    quoteTokenAddress,
                );
                // const spotPrice = await cachedQuerySpotPrice(
                //     crocEnv,
                //     baseTokenAddress,
                //     quoteTokenAddress,
                //     chainData.chainId,
                //     lastBlockNumber,
                // );
                if (spotPrice) {
                    const newDisplayPrice = getDisplayPrice(spotPrice);
                    if (newDisplayPrice !== poolPriceDisplay) {
                        IS_LOCAL_ENV &&
                            console.debug(
                                'setting new display pool price to: ' +
                                    newDisplayPrice,
                            );
                        setPoolPriceDisplay(newDisplayPrice);
                    }
                }
                if (spotPrice && spotPrice !== poolPriceNonDisplay) {
                    IS_LOCAL_ENV &&
                        console.debug('dispatching new non-display spot price');
                    dispatch(setPoolPriceNonDisplay(spotPrice));
                }
            })();
        }
    }, [
        isUserIdle,
        lastBlockNumber,
        baseTokenAddress + quoteTokenAddress,
        crocEnv,
        poolPriceNonDisplay === 0,
        isUserLoggedIn,
    ]);

    // useEffect to update selected token balances
    useEffect(() => {
        (async () => {
            if (
                crocEnv &&
                account &&
                isUserLoggedIn &&
                tradeData.baseToken.address &&
                tradeData.quoteToken.address
            ) {
                crocEnv
                    .token(tradeData.baseToken.address)
                    .walletDisplay(account)
                    .then((bal: string) => {
                        if (bal !== baseTokenBalance) {
                            IS_LOCAL_ENV &&
                                console.debug(
                                    'setting base token wallet balance',
                                );
                            setBaseTokenBalance(bal);
                        }
                    })
                    .catch(console.error);
                crocEnv
                    .token(tradeData.baseToken.address)
                    .balanceDisplay(account)
                    .then((bal: string) => {
                        if (bal !== baseTokenDexBalance) {
                            IS_LOCAL_ENV &&
                                console.debug('setting base token dex balance');
                            setBaseTokenDexBalance(bal);
                        }
                    })
                    .catch(console.error);
                crocEnv
                    .token(tradeData.quoteToken.address)
                    .walletDisplay(account)
                    .then((bal: string) => {
                        if (bal !== quoteTokenBalance) {
                            IS_LOCAL_ENV &&
                                console.debug('setting quote token balance');
                            setQuoteTokenBalance(bal);
                        }
                    })
                    .catch(console.error);
                crocEnv
                    .token(tradeData.quoteToken.address)
                    .balanceDisplay(account)
                    .then((bal: string) => {
                        if (bal !== quoteTokenDexBalance) {
                            IS_LOCAL_ENV &&
                                console.debug(
                                    'setting quote token dex balance',
                                );
                            setQuoteTokenDexBalance(bal);
                        }
                    })
                    .catch(console.error);
            }
        })();
    }, [
        crocEnv,
        isUserLoggedIn,
        account,
        tradeData.baseToken.address,
        tradeData.quoteToken.address,
        lastBlockNumber,
    ]);

    const [tokenAAllowance, setTokenAAllowance] = useState<string>('');
    const [tokenBAllowance, setTokenBAllowance] = useState<string>('');

    const [recheckTokenAApproval, setRecheckTokenAApproval] =
        useState<boolean>(false);
    const [recheckTokenBApproval, setRecheckTokenBApproval] =
        useState<boolean>(false);

    const tokenAAddress = tokenPair?.dataTokenA?.address;
    const tokenADecimals = tokenPair?.dataTokenA?.decimals;
    const tokenBAddress = tokenPair?.dataTokenB?.address;
    const tokenBDecimals = tokenPair?.dataTokenB?.decimals;
    // useEffect to check if user has approved CrocSwap to sell the token A
    useEffect(() => {
        (async () => {
            if (crocEnv && account && tokenAAddress) {
                try {
                    const allowance = await crocEnv
                        .token(tokenAAddress)
                        .allowance(account);
                    const newTokenAllowance = toDisplayQty(
                        allowance,
                        tokenADecimals,
                    );
                    if (tokenAAllowance !== newTokenAllowance) {
                        IS_LOCAL_ENV &&
                            console.debug('setting new token a allowance');
                        setTokenAAllowance(newTokenAllowance);
                    }
                } catch (err) {
                    console.warn(err);
                }
                if (recheckTokenAApproval) setRecheckTokenAApproval(false);
            }
        })();
    }, [
        crocEnv,
        tokenAAddress,
        lastBlockNumber,
        account,
        recheckTokenAApproval,
    ]);

    // useEffect to check if user has approved CrocSwap to sell the token B
    useEffect(() => {
        (async () => {
            if (crocEnv && tokenBAddress && tokenBDecimals && account) {
                try {
                    const allowance = await crocEnv
                        .token(tokenBAddress)
                        .allowance(account);
                    const newTokenAllowance = toDisplayQty(
                        allowance,
                        tokenBDecimals,
                    );
                    if (tokenBAllowance !== newTokenAllowance) {
                        IS_LOCAL_ENV &&
                            console.debug('new token b allowance set');
                        setTokenBAllowance(newTokenAllowance);
                    }
                } catch (err) {
                    console.warn(err);
                }
                if (recheckTokenBApproval) setRecheckTokenBApproval(false);
            }
        })();
    }, [
        crocEnv,
        tokenBAddress,
        lastBlockNumber,
        account,
        recheckTokenBApproval,
    ]);

    const graphData = useAppSelector((state) => state.graphData);

    const userLimitOrderStatesCacheEndpoint =
        httpGraphCacheServerDomain + '/user_limit_order_states?';

    useEffect(() => {
        if (isServerEnabled && isUserLoggedIn && account && crocEnv) {
            dispatch(resetConnectedUserDataLoadingStatus());

            IS_LOCAL_ENV && console.debug('fetching user positions');

            const userPositionsCacheEndpoint =
                httpGraphCacheServerDomain + '/user_positions?';

            try {
                fetch(
                    userPositionsCacheEndpoint +
                        new URLSearchParams({
                            user: account,
                            chainId: chainData.chainId,
                            ensResolution: 'true',
                            annotate: 'true',
                            // omitEmpty: 'true',
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
                                        searchableTokens,
                                        crocEnv,
                                        chainData.chainId,
                                        lastBlockNumber,
                                    );
                                }),
                            ).then((updatedPositions) => {
                                if (
                                    sum(graphData.positionsByUser.positions) !==
                                    sum(updatedPositions)
                                ) {
                                    dispatch(
                                        setPositionsByUser({
                                            dataReceived: true,
                                            positions: updatedPositions,
                                        }),
                                    );
                                }
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
                        user: account,
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
                                        searchableTokens,
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
                    tokenList: searchableTokens,
                    user: account,
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
                        }
                        const result: TokenIF[] = [];
                        const tokenMap = new Map();
                        const ambientTokens = getAmbientTokens();
                        for (const item of updatedTransactions as TransactionIF[]) {
                            if (!tokenMap.has(item.base)) {
                                const isFoundInAmbientList = ambientTokens.some(
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
                                const isFoundInAmbientList = ambientTokens.some(
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
                        // const transactedTokensMinusAmbientTokens = result.filter((token) => )
                        dispatch(setRecentTokens(result));
                    })
                    .catch(console.error);
            } catch (error) {
                console.error;
            }
        }
    }, [
        searchableTokens.length,
        isServerEnabled,
        tokensOnActiveLists,
        isUserLoggedIn,
        account,
        chainData.chainId,
        crocEnv,
    ]);

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

    const showSidebarByDefault = useMediaQuery('(min-width: 1776px)');

    function toggleSidebarBasedOnRoute() {
        if (sidebarManuallySet || !showSidebarByDefault) {
            return;
        } else {
            setShowSidebar(true);
            if (
                currentLocation === '/' ||
                currentLocation === '/swap' ||
                currentLocation.includes('/account')
            ) {
                setShowSidebar(false);
            }
        }
    }

    function toggleTradeTabBasedOnRoute() {
        setOutsideControl(true);
        if (currentLocation.includes('/market')) {
            setSelectedOutsideTab(0);
        } else if (currentLocation.includes('/limit')) {
            setSelectedOutsideTab(1);
        } else if (
            currentLocation.includes('/range') ||
            currentLocation.includes('reposition') ||
            currentLocation.includes('add')
        ) {
            setSelectedOutsideTab(2);
        }
    }

    useEffect(() => {
        toggleSidebarBasedOnRoute();
        if (
            !isCandleSelected &&
            !currentTxActiveInTransactions &&
            !currentPositionActive
        )
            toggleTradeTabBasedOnRoute();
    }, [location, isCandleSelected]);

    // function to sever connection between user wallet and the app
    const clickLogout = async () => {
        setCrocEnv(undefined);
        setBaseTokenBalance('');
        setQuoteTokenBalance('');
        setBaseTokenDexBalance('');
        setQuoteTokenDexBalance('');
        // dispatch(resetTradeData());
        dispatch(resetUserGraphData());
        dispatch(resetReceiptData());
        dispatch(resetTokenData());
        dispatch(resetUserAddresses());
        setIsShowAllEnabled(true);
        disconnect();
    };

    const [gasPriceInGwei, setGasPriceinGwei] = useState<number | undefined>();

    useEffect(() => {
        fetch(
            'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=KNJM7A9ST1Q1EESYXPPQITIP7I8EFSY456',
        )
            .then((response) => response.json())
            .then((response) => {
                if (response.result.ProposeGasPrice) {
                    const newGasPrice = parseInt(
                        response.result.ProposeGasPrice,
                    );
                    if (gasPriceInGwei !== newGasPrice) {
                        setGasPriceinGwei(newGasPrice);
                    }
                }
            })
            .catch(console.error);
    }, [lastBlockNumber]);

    const shouldDisplayAccountTab = isUserLoggedIn && account !== undefined;

    const [
        isWagmiModalOpenWallet,
        openWagmiModalWallet,
        closeWagmiModalWallet,
    ] = useModal();

    const [
        isGlobalModalOpen,
        openGlobalModal,
        closeGlobalModal,
        currentContent,
        title,
    ] = useGlobalModal();
    const [
        isGlobalPopupOpen,
        openGlobalPopup,
        closeGlobalPopup,
        popupContent,
        popupTitle,
        popupPlacement,
    ] = useGlobalPopup();

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const [isAppOverlayActive, setIsAppOverlayActive] = useState(false);

    // ------------------- FOLLOWING CODE IS PURELY RESPONSIBLE FOR PULSE ANIMATION------------

    const [isSwapCopied, setIsSwapCopied] = useState(false);
    const [isOrderCopied, setIsOrderCopied] = useState(false);
    const [isRangeCopied, setIsRangeCopied] = useState(false);

    const handlePulseAnimation = (type: string) => {
        switch (type) {
            case 'swap':
                setIsSwapCopied(true);
                setTimeout(() => {
                    setIsSwapCopied(false);
                }, 3000);
                break;
            case 'limitOrder':
                setIsOrderCopied(true);
                setTimeout(() => {
                    setIsOrderCopied(false);
                }, 3000);
                break;
            case 'range':
                setIsRangeCopied(true);

                setTimeout(() => {
                    setIsRangeCopied(false);
                }, 3000);
                break;
            default:
                break;
        }
    };

    // END OF------------------- FOLLOWING CODE IS PURELY RESPONSIBLE FOR PULSE ANIMATION------------

    // --------------THEME--------------------------
    // const defaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const [theme, setTheme] = useState('dark');

    const switchTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    // --------------END OF THEME--------------------------

    const connectedUserErc20Tokens = useAppSelector(
        (state) => state.userData.tokens.erc20Tokens,
    );
    // TODO: move this function up to App.tsx
    const getImportedTokensPlus = () => {
        // array of all tokens on Ambient list
        const ambientTokens = getAmbientTokens();
        // array of addresses on Ambient list
        const ambientAddresses = ambientTokens.map((tkn) =>
            tkn.address.toLowerCase(),
        );
        // use Ambient token list as scaffold to build larger token array
        const output = ambientTokens;
        // limiter for tokens to add from connected wallet
        let tokensAdded = 0;
        // iterate over tokens in connected wallet
        connectedUserErc20Tokens?.forEach((tkn) => {
            // gatekeep to make sure token is not already in the array,
            // ... that the token can be verified against a known list,
            // ... that user has a positive balance of the token, and
            // ... that the limiter has not been reached
            if (
                !ambientAddresses.includes(tkn.address.toLowerCase()) &&
                tokensOnActiveLists.get(
                    tkn.address + '_' + chainData.chainId,
                ) &&
                parseInt(tkn.combinedBalance as string) > 0 &&
                tokensAdded < 4
            ) {
                tokensAdded++;
                output.push({ ...tkn, fromList: 'wallet' });
                // increment the limiter by one
                tokensAdded++;
                // add the token to the output array
                output.push({ ...tkn, fromList: 'wallet' });
            }
        });
        // limiter for tokens to add from in-session recent tokens list
        let recentTokensAdded = 0;
        // iterate over tokens in recent tokens list
        getRecentTokens().forEach((tkn) => {
            // gatekeep to make sure the token isn't already in the list,
            // ... is on the current chain, and that the limiter has not
            // ... yet been reached
            if (
                !output.some(
                    (tk) =>
                        tk.address.toLowerCase() ===
                            tkn.address.toLowerCase() &&
                        tk.chainId === tkn.chainId,
                ) &&
                tkn.chainId === parseInt(chainData.chainId) &&
                recentTokensAdded < 2
            ) {
                // increment the limiter by one
                recentTokensAdded++;
                // add the token to the output array
                output.push(tkn);
            }
        });
        // return compiled array of tokens
        return output;
    };

    const { addRecentToken, getRecentTokens } = useRecentTokens(
        chainData.chainId,
    );

    // props for <PageHeader/> React element
    const headerProps = {
        isUserLoggedIn: isUserLoggedIn,
        clickLogout: clickLogout,
        ensName: ensName,
        shouldDisplayAccountTab: shouldDisplayAccountTab,
        chainId: chainData.chainId,
        isChainSupported: isChainSupported,
        openWagmiModalWallet: openWagmiModalWallet,
        openMoralisModalWallet: openWagmiModalWallet,
        lastBlockNumber: lastBlockNumber,
        isMobileSidebarOpen: isMobileSidebarOpen,
        setIsMobileSidebarOpen: setIsMobileSidebarOpen,
        poolPriceDisplay: poolPriceDisplay,
        openGlobalModal: openGlobalModal,
        closeGlobalModal: closeGlobalModal,
        isAppOverlayActive: isAppOverlayActive,
        setIsAppOverlayActive: setIsAppOverlayActive,
        ethMainnetUsdPrice: ethMainnetUsdPrice,
        recentPools: recentPools,
        switchTheme: switchTheme,
        theme: theme,
        chainData: chainData,
        getTokenByAddress: getTokenByAddress,
        isTutorialMode: isTutorialMode,
        setIsTutorialMode: setIsTutorialMode,
    };

    const [outputTokens, validatedInput, setInput, searchType] = useTokenSearch(
        chainData.chainId,
        verifyToken,
        getTokenByAddress,
        getTokensByName,
        getAmbientTokens,
        connectedUserErc20Tokens ?? [],
        getRecentTokens,
    );

    // props for <Swap/> React element
    const swapProps = {
        pool: pool,
        tokenPairLocal: tokenPairLocal,
        crocEnv: crocEnv,
        isUserLoggedIn: isUserLoggedIn,
        account: account,
        provider: provider,
        swapSlippage: swapSlippage,
        isPairStable: isPairStable,
        gasPriceInGwei: gasPriceInGwei,
        ethMainnetUsdPrice: ethMainnetUsdPrice,
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
        openModalWallet: openWagmiModalWallet,
        isInitialized: isInitialized,
        poolExists: poolExists,
        setTokenPairLocal: setTokenPairLocal,
        openGlobalModal: openGlobalModal,
        verifyToken: verifyToken,
        getTokensByName: getTokensByName,
        getTokenByAddress: getTokenByAddress,
        importedTokensPlus: getImportedTokensPlus(),
        getRecentTokens: getRecentTokens,
        addRecentToken: addRecentToken,
        outputTokens: outputTokens,
        validatedInput: validatedInput,
        setInput: setInput,
        searchType: searchType,
        openGlobalPopup: openGlobalPopup,
        isTutorialMode: isTutorialMode,
        setIsTutorialMode: setIsTutorialMode,
        dexBalancePrefs: {
            swap: dexBalPrefSwap,
            limit: dexBalPrefLimit,
            range: dexBalPrefRange,
        },
        bypassConfirm: {
            swap: bypassConfirmSwap,
            limit: bypassConfirmLimit,
            range: bypassConfirmRange,
            repo: bypassConfirmRepo,
        },
        ackTokens: ackTokens,
        chainData: chainData,
    };

    // props for <Swap/> React element on trade route
    const swapPropsTrade = {
        pool: pool,
        crocEnv: crocEnv,
        isUserLoggedIn: isConnected,
        account: account,
        provider: provider,
        swapSlippage: swapSlippage,
        isPairStable: isPairStable,
        isOnTradeRoute: true,
        gasPriceInGwei: gasPriceInGwei,
        ethMainnetUsdPrice: ethMainnetUsdPrice,
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
        openModalWallet: openWagmiModalWallet,
        isInitialized: isInitialized,
        poolExists: poolExists,
        openGlobalModal: openGlobalModal,
        isSwapCopied: isSwapCopied,
        verifyToken: verifyToken,
        getTokensByName: getTokensByName,
        getTokenByAddress: getTokenByAddress,
        importedTokensPlus: getImportedTokensPlus(),
        getRecentTokens: getRecentTokens,
        addRecentToken: addRecentToken,
        outputTokens: outputTokens,
        validatedInput: validatedInput,
        setInput: setInput,
        searchType: searchType,
        openGlobalPopup: openGlobalPopup,
        isTutorialMode: isTutorialMode,
        setIsTutorialMode: setIsTutorialMode,
        tokenPairLocal: tokenPairLocal,
        dexBalancePrefs: {
            swap: dexBalPrefSwap,
            limit: dexBalPrefLimit,
            range: dexBalPrefRange,
        },
        bypassConfirm: {
            swap: bypassConfirmSwap,
            limit: bypassConfirmLimit,
            range: bypassConfirmRange,
            repo: bypassConfirmRepo,
        },
        ackTokens: ackTokens,
        chainData: chainData,
    };

    // props for <Limit/> React element on trade route
    const limitPropsTrade = {
        account: account,
        pool: pool,
        crocEnv: crocEnv,
        chainData: chainData,
        isUserLoggedIn: isUserLoggedIn,
        provider: provider,
        mintSlippage: mintSlippage,
        isPairStable: isPairStable,
        isOnTradeRoute: true,
        gasPriceInGwei: gasPriceInGwei,
        ethMainnetUsdPrice: ethMainnetUsdPrice,
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
        openModalWallet: openWagmiModalWallet,
        openGlobalModal: openGlobalModal,
        closeGlobalModal: closeGlobalModal,
        poolExists: poolExists,
        isOrderCopied: isOrderCopied,
        verifyToken: verifyToken,
        getTokensByName: getTokensByName,
        getTokenByAddress: getTokenByAddress,
        importedTokensPlus: getImportedTokensPlus(),
        getRecentTokens: getRecentTokens,
        addRecentToken: addRecentToken,
        setResetLimitTick: setResetLimitTick,
        outputTokens: outputTokens,
        validatedInput: validatedInput,
        setInput: setInput,
        searchType: searchType,
        openGlobalPopup: openGlobalPopup,
        isTutorialMode: isTutorialMode,
        setIsTutorialMode: setIsTutorialMode,
        dexBalancePrefs: {
            swap: dexBalPrefSwap,
            limit: dexBalPrefLimit,
            range: dexBalPrefRange,
        },
        bypassConfirm: {
            swap: bypassConfirmSwap,
            limit: bypassConfirmLimit,
            range: bypassConfirmRange,
            repo: bypassConfirmRepo,
        },
        ackTokens: ackTokens,
    };

    // props for <Range/> React element
    const [rangetokenAQtyLocal, setRangeTokenAQtyLocal] = useState<number>(0);
    const [rangetokenBQtyLocal, setRangeTokenBQtyLocal] = useState<number>(0);

    const rangeProps = {
        account: account,
        crocEnv: crocEnv,
        isUserLoggedIn: isUserLoggedIn,
        provider: provider,
        mintSlippage: mintSlippage,
        isPairStable: isPairStable,
        lastBlockNumber: lastBlockNumber,
        gasPriceInGwei: gasPriceInGwei,
        ethMainnetUsdPrice: ethMainnetUsdPrice,
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
        openModalWallet: openWagmiModalWallet,
        ambientApy: ambientApy,
        dailyVol: dailyVol,
        graphData: graphData,
        openGlobalModal: openGlobalModal,
        poolExists: poolExists,
        isRangeCopied: isRangeCopied,
        tokenAQtyLocal: rangetokenAQtyLocal,
        tokenBQtyLocal: rangetokenBQtyLocal,
        setTokenAQtyLocal: setRangeTokenAQtyLocal,
        setTokenBQtyLocal: setRangeTokenBQtyLocal,
        verifyToken: verifyToken,
        getTokensByName: getTokensByName,
        getTokenByAddress: getTokenByAddress,
        importedTokensPlus: getImportedTokensPlus(),
        getRecentTokens: getRecentTokens,
        addRecentToken: addRecentToken,
        outputTokens: outputTokens,
        validatedInput: validatedInput,
        setInput: setInput,
        searchType: searchType,
        openGlobalPopup: openGlobalPopup,
        isTutorialMode: isTutorialMode,
        setIsTutorialMode: setIsTutorialMode,
        dexBalancePrefs: {
            swap: dexBalPrefSwap,
            limit: dexBalPrefLimit,
            range: dexBalPrefRange,
        },
        setSimpleRangeWidth: setSimpleRangeWidth,
        simpleRangeWidth: simpleRangeWidth,
        setMaxPrice: setMaxRangePrice,
        setMinPrice: setMinRangePrice,
        setChartTriggeredBy: setChartTriggeredBy,
        chartTriggeredBy: chartTriggeredBy,
        minPrice: minRangePrice,
        maxPrice: maxRangePrice,
        rescaleRangeBoundariesWithSlider: rescaleRangeBoundariesWithSlider,
        setRescaleRangeBoundariesWithSlider:
            setRescaleRangeBoundariesWithSlider,
        bypassConfirm: {
            swap: bypassConfirmSwap,
            limit: bypassConfirmLimit,
            range: bypassConfirmRange,
            repo: bypassConfirmRepo,
        },
        ackTokens: ackTokens,
        cachedFetchTokenPrice: cachedFetchTokenPrice,
        chainData: chainData,
    };

    function toggleSidebar() {
        setShowSidebar(!showSidebar);
        setSidebarManuallySet(true);
    }

    const [selectedOutsideTab, setSelectedOutsideTab] = useState(0);
    const [outsideControl, setOutsideControl] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const [fullScreenChart, setFullScreenChart] = useState(false);

    const [analyticsSearchInput, setAnalyticsSearchInput] = useState('');

    // props for <Sidebar/> React element
    const sidebarProps = {
        tradeData: tradeData,
        isDenomBase: tradeData.isDenomBase,
        showSidebar: showSidebar,
        toggleSidebar: toggleSidebar,
        setShowSidebar: setShowSidebar,
        chainId: chainData.chainId,
        poolId: chainData.poolIndex,

        currentTxActiveInTransactions: currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions: setCurrentTxActiveInTransactions,
        isShowAllEnabled: isShowAllEnabled,
        setIsShowAllEnabled: setIsShowAllEnabled,
        expandTradeTable: expandTradeTable,
        setExpandTradeTable: setExpandTradeTable,
        tokenMap: tokensOnActiveLists,
        lastBlockNumber: lastBlockNumber,
        favePools: favePools,

        selectedOutsideTab: selectedOutsideTab,
        setSelectedOutsideTab: setSelectedOutsideTab,
        outsideControl: outsideControl,
        setOutsideControl: setOutsideControl,

        currentPositionActive: currentPositionActive,
        setCurrentPositionActive: setCurrentPositionActive,

        analyticsSearchInput: analyticsSearchInput,
        setAnalyticsSearchInput: setAnalyticsSearchInput,
        openModalWallet: openWagmiModalWallet,
        poolList: poolList,
        verifyToken: verifyToken,
        getTokenByAddress: getTokenByAddress,
        tokenPair: tokenPair,
        recentPools: recentPools,
        isConnected: isConnected,
        // Filter positions from graph cache for this specific chain
        positionsByUser: graphData.positionsByUser.positions.filter(
            (x) => x.chainId === chainData.chainId,
        ),
        txsByUser: graphData.changesByUser.changes.filter(
            (x) => x.chainId === chainData.chainId,
        ),
        limitsByUser: graphData.limitOrdersByUser.limitOrders.filter(
            (x) => x.chainId === chainData.chainId,
        ),
        ackTokens: ackTokens,
        topPools: topPools,
    };

    const isBaseTokenMoneynessGreaterOrEqual: boolean = useMemo(
        () =>
            getMoneynessRank(
                baseTokenAddress.toLowerCase() + '_' + chainData.chainId,
            ) -
                getMoneynessRank(
                    quoteTokenAddress.toLowerCase() + '_' + chainData.chainId,
                ) >=
            0,
        [baseTokenAddress, quoteTokenAddress, chainData.chainId],
    );

    function updateDenomIsInBase() {
        // we need to know if the denom token is base or quote
        // currently the denom token is the cheaper one by default
        // ergo we need to know if the cheaper token is base or quote
        // whether pool price is greater or less than 1 indicates which is more expensive
        // if pool price is < 0.1 then denom token will be quote (cheaper one)
        // if pool price is > 0.1 then denom token will be base (also cheaper one)
        // then reverse if didUserToggleDenom === true

        const isDenomInBase = isBaseTokenMoneynessGreaterOrEqual
            ? tradeData.didUserFlipDenom
                ? true
                : false
            : tradeData.didUserFlipDenom
            ? false
            : true;

        return isDenomInBase;
    }

    useEffect(() => {
        const isDenomBase = updateDenomIsInBase();
        if (isDenomBase !== undefined) {
            if (tradeData.isDenomBase !== isDenomBase) {
                IS_LOCAL_ENV && console.debug('denomination changed');
                dispatch(setDenomInBase(isDenomBase));
            }
        }
    }, [tradeData.didUserFlipDenom, tokenPair]);

    const [imageData, setImageData] = useState<string[]>([]);

    useEffect(() => {
        dispatch(resetUserGraphData());
    }, [account]);

    useEffect(() => {
        (async () => {
            if (account) {
                const imageLocalURLs = await getNFTs(account);
                if (imageLocalURLs) setImageData(imageLocalURLs);
            }
        })();
    }, [account]);

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
        isChainSupported && <Sidebar {...sidebarProps} />;

    // Heartbeat that checks if the chat server is reachable and has a stable db connection every 10 seconds.
    const { getStatus } = useChatApi();
    useEffect(() => {
        const interval = setInterval(() => {
            getStatus().then((isChatUp) => {
                setIsChatEnabled(isChatUp);
            });
        }, 10000);
        return () => clearInterval(interval);
    }, [isChatEnabled]);

    useEffect(() => {
        if (!currentLocation.startsWith('/trade')) {
            setFullScreenChart(false);
        }
    }, [currentLocation]);

    const sidebarDislayStyle = showSidebar
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

    // hook to track user's sidebar preference open or closed
    // also functions to toggle sidebar status between open and closed
    const [sidebarStatus, openSidebar, closeSidebar, togggggggleSidebar] =
        useSidebar(location.pathname);
    // these lines are just here to make the linter happy
    // take them out before production, they serve no other purpose
    false && sidebarStatus;

    const containerStyle = currentLocation.includes('trade')
        ? 'content-container-trade'
        : 'content-container';

    interface UrlRoutesTemplate {
        swap: string;
        market: string;
        limit: string;
        range: string;
    }

    function createDefaultUrlParams(chainId: string): UrlRoutesTemplate {
        const [tokenA, tokenB] = getDefaultPairForChain(chainId);
        const pairSlug = formSlugForPairParams(chainId, tokenA, tokenB);
        return {
            swap: `/swap/${pairSlug}`,
            market: `/trade/market/${pairSlug}&lowTick=0&highTick=0`,
            range: `/trade/range/${pairSlug}&lowTick=0&highTick=0`,
            limit: `/trade/limit/${pairSlug}&lowTick=0&highTick=0`,
        };
    }

    const initUrl = createDefaultUrlParams(chainData.chainId);
    const [defaultUrlParams, setDefaultUrlParams] =
        useState<UrlRoutesTemplate>(initUrl);

    useEffect(() => {
        setDefaultUrlParams(createDefaultUrlParams(chainData.chainId));
    }, [chainData.chainId]);

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
            setShowSidebar(!showSidebar);
        },
    );
    useKeyboardShortcuts(
        { modifierKeys: ['Shift', 'Control'], key: 'C' },
        () => {
            setIsChatOpen(!isChatOpen);
        },
    );

    // Since input field are autofocused on each route, we need. away for the user to exit that focus on their keyboard. This achieves that.

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

    const tradeProps = {
        gasPriceInGwei,
        ethMainnetUsdPrice,
        chartSettings,
        tokenList: searchableTokens,
        cachedQuerySpotPrice,
        cachedPositionUpdateQuery,
        pool,
        isUserLoggedIn,
        crocEnv,
        provider,
        candleData,
        baseTokenAddress,
        quoteTokenAddress,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        tokenPair,
        account: account ?? '',
        lastBlockNumber,
        isTokenABase,
        poolPriceDisplay,
        chainId: chainData.chainId,
        chainData,
        currentTxActiveInTransactions,

        setCurrentTxActiveInTransactions,
        isShowAllEnabled,
        setIsShowAllEnabled,
        expandTradeTable,
        setExpandTradeTable,
        tokenMap: tokensOnActiveLists,
        favePools,
        selectedOutsideTab,
        setSelectedOutsideTab,
        outsideControl,
        setOutsideControl,
        currentPositionActive,
        setCurrentPositionActive,
        openGlobalModal,
        closeGlobalModal,
        isInitialized,
        poolPriceNonDisplay,
        setLimitRate: function (): void {
            throw new Error('Function not implemented.');
        },
        limitRate: '',
        searchableTokens: searchableTokens,
        poolExists,
        setTokenPairLocal,
        showSidebar,
        handlePulseAnimation,
        isCandleSelected,
        setIsCandleSelected,
        fullScreenChart,
        setFullScreenChart,
        fetchingCandle,
        setFetchingCandle,
        isCandleDataNull,
        setIsCandleDataNull,
        minPrice: minRangePrice,
        maxPrice: maxRangePrice,
        setMaxPrice: setMaxRangePrice,
        setMinPrice: setMinRangePrice,
        rescaleRangeBoundariesWithSlider,
        setRescaleRangeBoundariesWithSlider,
        isTutorialMode,
        setIsTutorialMode,
        setCandleDomains,
        setSimpleRangeWidth,
        simpleRangeWidth,
        setRepositionRangeWidth,
        repositionRangeWidth,
        dexBalancePrefs: {
            swap: dexBalPrefSwap,
            limit: dexBalPrefLimit,
            range: dexBalPrefRange,
        },
        setChartTriggeredBy,
        chartTriggeredBy,
        slippage: {
            swapSlippage,
            mintSlippage,
            repoSlippage,
        },
    };

    const accountProps = {
        gasPriceInGwei,
        ethMainnetUsdPrice,
        searchableTokens,
        cachedQuerySpotPrice,
        cachedPositionUpdateQuery,
        crocEnv: crocEnv,
        addRecentToken,
        getRecentTokens,
        getAmbientTokens,
        getTokensByName,
        verifyToken: verifyToken,
        getTokenByAddress,
        isTokenABase,
        provider,
        cachedFetchErc20TokenBalances,

        cachedFetchNativeTokenBalance,
        cachedFetchTokenPrice,
        ensName,
        lastBlockNumber,
        connectedAccount: account ? account : '',
        userImageData: imageData,
        chainId: chainData.chainId,
        tokensOnActiveLists,
        selectedOutsideTab,
        setSelectedOutsideTab,
        outsideControl,
        setOutsideControl,
        // userAccount:true,
        openGlobalModal,
        closeGlobalModal,
        chainData: chainData,
        currentPositionActive,
        setCurrentPositionActive,
        account: account ?? '',
        showSidebar,
        isUserLoggedIn,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        handlePulseAnimation,
        outputTokens,
        validatedInput,
        setInput,
        searchType,
        openModalWallet: openWagmiModalWallet,
        mainnetProvider,
        setSimpleRangeWidth,
        dexBalancePrefs: {
            swap: dexBalPrefSwap,
            limit: dexBalPrefLimit,
            range: dexBalPrefRange,
        },
        slippage: {
            swapSlippage,
            mintSlippage,
            repoSlippage,
        },
        ackTokens,
        setExpandTradeTable,
    };

    const repositionProps = {
        chainData,
        ethMainnetUsdPrice,
        gasPriceInGwei,
        lastBlockNumber,
        tokenPair,
        crocEnv,
        chainId: chainData.chainId,
        provider,
        ambientApy,
        dailyVol,
        isDenomBase: tradeData.isDenomBase,
        repoSlippage,
        isPairStable,
        setMaxPrice: setMaxRangePrice,
        setMinPrice: setMinRangePrice,
        setRescaleRangeBoundariesWithSlider,
        poolPriceDisplay,
        setSimpleRangeWidth: setRepositionRangeWidth,
        simpleRangeWidth: repositionRangeWidth,
        bypassConfirm: {
            swap: bypassConfirmSwap,
            limit: bypassConfirmLimit,
            range: bypassConfirmRange,
            repo: bypassConfirmRepo,
        },
        openGlobalPopup,
    };

    const chatProps = {
        isChatEnabled: isChatEnabled,
        isChatOpen: true,
        onClose: () => {
            console.error('Function not implemented.');
        },
        favePools: favePools,
        currentPool: currentPoolInfo,
        setIsChatOpen: setIsChatOpen,
        isFullScreen: true,
        userImageData: imageData,
        username: ensName,
        appPage: true,
        topPools: topPools,
        setIsChatEnabled: setIsChatEnabled,
    };

    return (
        <>
            <div className={containerStyle} data-theme={theme}>
                {isMobileSidebarOpen && <div className='blur_app' />}
                <AppOverlay
                    isAppOverlayActive={isAppOverlayActive}
                    setIsAppOverlayActive={setIsAppOverlayActive}
                />
                {currentLocation !== '/404' && <PageHeader {...headerProps} />}
                <section
                    className={`${showSidebarOrNullStyle} ${swapBodyStyle}`}
                >
                    {!currentLocation.startsWith('/swap') && sidebarRender}
                    <Routes>
                        <Route
                            index
                            element={
                                <Home
                                    cachedQuerySpotPrice={cachedQuerySpotPrice}
                                    tokenMap={tokensOnActiveLists}
                                    lastBlockNumber={lastBlockNumber}
                                    crocEnv={crocEnv}
                                    chainId={chainData.chainId}
                                    isServerEnabled={isServerEnabled}
                                    topPools={topPools}
                                    cachedPoolStatsFetch={cachedPoolStatsFetch}
                                />
                            }
                        />
                        <Route path='trade' element={<Trade {...tradeProps} />}>
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
                                element={<Swap {...swapPropsTrade} />}
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
                            <Route
                                path='limit/:params'
                                element={<Limit {...limitPropsTrade} />}
                            />

                            <Route
                                path='range'
                                element={
                                    <Navigate
                                        to={defaultUrlParams.range}
                                        replace
                                    />
                                }
                            />
                            <Route
                                path='range/:params'
                                element={<Range {...rangeProps} />}
                            />
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
                                element={<Reposition {...repositionProps} />}
                            />
                            <Route path='add' element={<RangeAdd />} />
                            <Route
                                path='edit/'
                                element={
                                    <Navigate to='/trade/market' replace />
                                }
                            />
                        </Route>
                        <Route
                            path='chat'
                            element={<ChatPanel {...chatProps} />}
                        />

                        <Route
                            path='chat/:params'
                            element={<ChatPanel {...chatProps} />}
                        />
                        <Route
                            path='range2'
                            element={<Range {...rangeProps} />}
                        />
                        <Route
                            path='initpool/:params'
                            element={
                                <InitPool
                                    isUserLoggedIn={isUserLoggedIn}
                                    crocEnv={crocEnv}
                                    gasPriceInGwei={gasPriceInGwei}
                                    ethMainnetUsdPrice={ethMainnetUsdPrice}
                                    showSidebar={showSidebar}
                                    openModalWallet={openWagmiModalWallet}
                                    tokenAAllowance={tokenAAllowance}
                                    tokenBAllowance={tokenBAllowance}
                                    setRecheckTokenAApproval={
                                        setRecheckTokenAApproval
                                    }
                                    setRecheckTokenBApproval={
                                        setRecheckTokenBApproval
                                    }
                                />
                            }
                        />
                        <Route
                            path='account'
                            element={
                                <Portfolio
                                    {...accountProps}
                                    userAccount={true}
                                />
                            }
                        />
                        <Route
                            path='account/:address'
                            element={
                                <Portfolio
                                    {...accountProps}
                                    userAccount={false}
                                />
                            }
                        />

                        <Route
                            path='swap'
                            element={
                                <Navigate replace to={defaultUrlParams.swap} />
                            }
                        />
                        <Route
                            path='swap/:params'
                            element={<Swap {...swapProps} />}
                        />
                        <Route path='tos' element={<TermsOfService />} />
                        {IS_LOCAL_ENV && (
                            <Route
                                path='testpage'
                                element={
                                    <TestPage
                                        openGlobalModal={openGlobalModal}
                                        openSidebar={openSidebar}
                                        closeSidebar={closeSidebar}
                                        togggggggleSidebar={togggggggleSidebar}
                                        walletToS={walletToS}
                                        chartSettings={chartSettings}
                                        bypassConf={{
                                            swap: bypassConfirmSwap,
                                            limit: bypassConfirmLimit,
                                            range: bypassConfirmRange,
                                            repo: bypassConfirmRepo,
                                        }}
                                    />
                                }
                            />
                        )}
                        <Route
                            path='/:address'
                            element={
                                <Portfolio
                                    {...accountProps}
                                    userAccount={false}
                                />
                            }
                        />
                        <Route path='/404' element={<NotFound />} />
                    </Routes>
                </section>
                {snackbarContent}
            </div>
            <div className='footer_container'>
                {currentLocation !== '/' &&
                    !currentLocation.includes('/chat') &&
                    isChatEnabled && (
                        <ChatPanel
                            isChatOpen={isChatOpen}
                            onClose={() => {
                                console.error('Function not implemented.');
                            }}
                            favePools={favePools}
                            currentPool={currentPoolInfo}
                            setIsChatOpen={setIsChatOpen}
                            isFullScreen={false}
                            userImageData={imageData}
                            topPools={topPools}
                            isChatEnabled={isChatEnabled}
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
            <GlobalPopup
                isGlobalPopupOpen={isGlobalPopupOpen}
                openGlobalPopup={openGlobalPopup}
                closeGlobalPopup={closeGlobalPopup}
                popupContent={popupContent}
                popupTitle={popupTitle}
                placement={popupPlacement}
            />
            {isWagmiModalOpenWallet && (
                <WalletModalWagmi closeModalWallet={closeWagmiModalWallet} />
            )}
        </>
    );
}
