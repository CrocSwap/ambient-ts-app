/** ***** Import React and Dongles *******/
import { useEffect, useState, useMemo, useCallback } from 'react';
import {
    Routes,
    Route,
    useLocation,
    Navigate,
    useNavigate,
} from 'react-router-dom';
import {
    resetUserGraphData,
    setPositionsByUser,
    setChangesByUser,
    setLimitOrdersByUser,
    CandlesByPoolAndDuration,
    CandleData,
    setLastBlock,
    setDataLoadingStatus,
    resetConnectedUserDataLoadingStatus,
} from '../utils/state/graphDataSlice';
import { useAccount, useDisconnect, useProvider, useSigner } from 'wagmi';
import useWebSocket from 'react-use-websocket';
import { CrocEnv } from '@crocswap-libs/sdk';
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
import { PoolContext } from '../contexts/PoolContext';

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
    setDenomInBase,
    setLimitTick,
    setPoolPriceNonDisplay,
    candleDomain,
    candleScale,
} from '../utils/state/tradeDataSlice';
import { memoizeQuerySpotPrice } from './functions/querySpotPrice';
import {
    memoizeFetchErc20TokenBalances,
    memoizeFetchNativeTokenBalance,
} from './functions/fetchTokenBalances';
import { memoizePoolStats } from './functions/getPoolStats';
import { useAppChain } from './hooks/useAppChain';
import {
    resetTokenData,
    resetUserAddresses,
    setAddressAtLogin,
    setAddressCurrent,
    setErc20Tokens,
    setIsLoggedIn,
    setNativeToken,
    setRecentTokens,
} from '../utils/state/userDataSlice';
import { isStablePair } from '../utils/data/stablePairs';
import {
    APP_ENVIRONMENT,
    CHAT_ENABLED,
    GRAPHCACHE_URL,
    GRAPHCACHE_WSS_URL,
    IS_LOCAL_ENV,
} from '../constants';
import { useModal } from '../components/Global/Modal/useModal';
import { useGlobalModal } from './components/GlobalModal/useGlobalModal';
import GlobalModal from './components/GlobalModal/GlobalModal';
import { memoizeTokenPrice } from './functions/fetchTokenPrice';
import ChatPanel from '../components/Chat/ChatPanel';
import {
    getPositionData,
    memoizePositionUpdate,
} from './functions/getPositionData';
import { getLimitOrderData } from './functions/getLimitOrderData';
import { fetchUserRecentChanges } from './functions/fetchUserRecentChanges';
import AppOverlay from '../components/Global/AppOverlay/AppOverlay';
import { useSidebar } from './hooks/useSidebar';
import useDebounce from './hooks/useDebounce';
import { useRecentTokens } from './hooks/useRecentTokens';
import { useTokenSearch } from './hooks/useTokenSearch';
import WalletModalWagmi from './components/WalletModal/WalletModalWagmi';
import { usePoolList } from './hooks/usePoolList';
import { recentPoolsMethodsIF, useRecentPools } from './hooks/useRecentPools';
import useMediaQuery from '../utils/hooks/useMediaQuery';
import { useGlobalPopup } from './components/GlobalPopup/useGlobalPopup';
import GlobalPopup from './components/GlobalPopup/GlobalPopup';
import { memoizePoolLiquidity } from './functions/getPoolLiquidity';
import { getMoneynessRank } from '../utils/functions/getMoneynessRank';
import { Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { useSlippage } from './hooks/useSlippage';
import { slippage } from '../utils/data/slippage';
import { useChartSettings } from './hooks/useChartSettings';
import { useSkin } from './hooks/useSkin';
import { useExchangePrefs } from './hooks/useExchangePrefs';
import { useSkipConfirm } from './hooks/useSkipConfirm';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';
import { mktDataChainId } from '../utils/data/chains';
import useKeyPress from './hooks/useKeyPress';
import { topPoolIF, useTopPools } from './hooks/useTopPools';
import { formSlugForPairParams } from './functions/urlSlugs';
import useChatApi from '../components/Chat/Service/ChatApi';
import { CrocEnvContext } from '../contexts/CrocEnvContext';
import Accessibility from '../pages/Accessibility/Accessibility';
import { tokenMethodsIF, useTokens } from './hooks/useTokens';
import { diffHashSig } from '../utils/functions/diffHashSig';
import { useFavePools } from './hooks/useFavePools';
import { UserPreferenceContext } from '../contexts/UserPreferenceContext';
import { AppStateContext } from '../contexts/AppStateContext';
import { useSnackbar } from '../components/Global/SnackbarComponent/useSnackbar';
import useWebSocketSubs from './hooks/useWebSocketSubs';
import { usePoolMetadata } from './hooks/usePoolMetadata';
import { usePoolPricing } from './hooks/usePoolPricing';
import { useTokenPairAllowance } from './hooks/useTokenPairAllowance';
import { RangeContext } from '../contexts/RangeContext';
import { CandleContext } from '../contexts/CandleContext';
import { useBlacklist } from './hooks/useBlacklist';
import { ChainDataContext } from '../contexts/ChainDataContext';
import { ChartContext } from '../contexts/ChartContext';
import { SidebarContext } from '../contexts/SidebarContext';
import { TradeTableContext } from '../contexts/TradeTableContext';
import { UserDataContext } from '../contexts/UserDataContext';
import { TokenContext } from '../contexts/TokenContext';
import { TradeTokenContext } from '../contexts/TradeTokenContext';

// CONTEXT: cached data context - investigate if this is necessary after context changes
const cachedFetchNativeTokenBalance = memoizeFetchNativeTokenBalance();
const cachedFetchErc20TokenBalances = memoizeFetchErc20TokenBalances();
const cachedFetchTokenPrice = memoizeTokenPrice();
const cachedPositionUpdateQuery = memoizePositionUpdate();
const cachedPoolStatsFetch = memoizePoolStats();
const cachedPoolLiquidity = memoizePoolLiquidity();
const cachedQuerySpotPrice = memoizeQuerySpotPrice();

const httpGraphCacheServerDomain = GRAPHCACHE_URL;
const wssGraphCacheServerDomain = GRAPHCACHE_WSS_URL;

const shouldCandleSubscriptionsReconnect = true;
const shouldNonCandleSubscriptionsReconnect = true;

/** ***** React Function *******/
export default function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentLocation = location.pathname;

    const { disconnect } = useDisconnect();

    // CONTEXT: to be removed, have components that require it reference it directly
    const tradeData = useAppSelector((state) => state.tradeData);
    const tokenPair = useMemo(() => {
        return {
            dataTokenA: tradeData.tokenA,
            dataTokenB: tradeData.tokenB,
        };
    }, [tradeData.tokenA, tradeData.tokenB]);
    const userData = useAppSelector((state) => state.userData);
    const isUserIdle = userData.isUserIdle;
    const receiptData = useAppSelector((state) => state.receiptData);
    const lastReceipt =
        receiptData.sessionReceipts.length > 0 &&
        isJsonString(receiptData.sessionReceipts[0])
            ? JSON.parse(receiptData.sessionReceipts[0])
            : null;
    const isLastReceiptSuccess = lastReceipt?.status === 1;
    const lastReceiptHash = useMemo(
        () => (lastReceipt ? diffHashSig(lastReceipt) : undefined),
        [lastReceipt],
    );

    // CONTEXT: remove and reference as necessary
    const provider = useProvider();
    const {
        data: signer,
        isError,
        error,
        status: signerStatus,
        //  isLoading
    } = useSigner();

    const dispatch = useAppDispatch();

    /* ------------------------------------------ APP STATE CONTEXT ------------------------------------------ */
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [isAppOverlayActive, setIsAppOverlayActive] = useState(false);
    const [isTutorialMode, setIsTutorialMode] = useState(false);
    const [selectedOutsideTab, setSelectedOutsideTab] = useState(0);
    const [outsideControl, setOutsideControl] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isChatEnabled, setIsChatEnabled] = useState(CHAT_ENABLED);
    const { address: userAddress, isConnected } = useAccount();

    // allow a local environment variable to be defined in [app_repo]/.env.local to turn off connections to the cache server
    const isServerEnabled =
        process.env.REACT_APP_CACHE_SERVER_IS_ENABLED !== undefined
            ? process.env.REACT_APP_CACHE_SERVER_IS_ENABLED.toLowerCase() ===
              'true'
            : true;

    // allow a local environment variable to be defined in [app_repo]/.env.local to turn off subscriptions to the cache and chat servers
    const areSubscriptionsEnabled =
        process.env.REACT_APP_SUBSCRIPTIONS_ARE_ENABLED !== undefined
            ? process.env.REACT_APP_SUBSCRIPTIONS_ARE_ENABLED.toLowerCase() ===
              'true'
            : true;

    // All of these objects results from use*() functions are assumed to be memoized correct,
    // I.e. updated if and only if their conrents need to be updated.
    const snackbar = useSnackbar();
    const globalModal = useGlobalModal();
    const globalPopup = useGlobalPopup();
    const skin = useSkin('purple_dark');

    const [
        isWagmiModalOpenWallet,
        openWagmiModalWallet,
        closeWagmiModalWallet,
    ] = useModal();

    const appState = useMemo(
        () => ({
            appOverlay: {
                isActive: isAppOverlayActive,
                setIsActive: setIsAppOverlayActive,
            },
            globalModal,
            globalPopup,
            snackbar,
            tutorial: {
                isActive: isTutorialMode,
                setIsActive: setIsTutorialMode,
            },
            skin,
            theme: { selected: theme, setSelected: setTheme },
            // TODO: investigate what this actually does... move into trade tab context?
            outsideTab: {
                selected: selectedOutsideTab,
                setSelected: setSelectedOutsideTab,
            },
            outsideControl: {
                isActive: outsideControl,
                setIsActive: setOutsideControl,
            },
            // TODO: move into chat context
            chat: {
                isOpen: isChatOpen,
                setIsOpen: setIsChatOpen,
                isEnabled: isChatEnabled,
                setIsEnabled: setIsChatEnabled,
            },
            server: { isEnabled: isServerEnabled },
            subscriptions: { isEnabled: areSubscriptionsEnabled },
            wagmiModal: {
                isOpen: isWagmiModalOpenWallet,
                open: openWagmiModalWallet,
                close: closeWagmiModalWallet,
            },
        }),
        [
            // Dependency list includes the memoized use*() values from above and any primitives
            // directly references in above appState object
            snackbar,
            globalModal,
            globalPopup,
            skin,
            isChatOpen,
            isChatEnabled,
            isServerEnabled,
            areSubscriptionsEnabled,
            isAppOverlayActive,
            isTutorialMode,
            theme,
            selectedOutsideTab,
            outsideControl,
            isWagmiModalOpenWallet,
        ],
    );

    // Heartbeat that checks if the chat server is reachable and has a stable db connection every 60 seconds.
    const { getStatus } = useChatApi();
    useEffect(() => {
        if (CHAT_ENABLED) {
            const interval = setInterval(() => {
                getStatus().then((isChatUp) => {
                    appState.chat.setIsEnabled(isChatUp);
                });
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [appState.chat.isEnabled, CHAT_ENABLED]);

    /* ------------------------------------------ END APP STATE CONTEXT ------------------------------------------ */

    /* ------------------------------------------ CROC ENV CONTEXT ------------------------------------------ */
    const [crocEnv, setCrocEnv] = useState<CrocEnv | undefined>();
    const [chainData, isChainSupported] = useAppChain(isConnected);
    // hook to manage top pools data
    const topPools: topPoolIF[] = useTopPools(chainData.chainId);

    const [ethMainnetUsdPrice, setEthMainnetUsdPrice] = useState<
        number | undefined
    >();

    const crocEnvState = {
        crocEnv,
        setCrocEnv,
        chainData,
        isChainSupported,
        topPools,
        ethMainnetUsdPrice,
        setEthMainnetUsdPrice,
    };

    useBlacklist(userAddress);

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
            const newCrocEnv = new CrocEnv(
                provider,
                signer ? signer : undefined,
            );
            setCrocEnv(newCrocEnv);
        } else {
            // If signer and provider are set to different chains (as can happen)
            // after a network switch, it causes a lot of performance killing timeouts
            // and errors
            if (
                (await signer?.getChainId()) ==
                (await provider.getNetwork()).chainId
            ) {
                const newCrocEnv = new CrocEnv(
                    provider,
                    signer ? signer : undefined,
                );
                APP_ENVIRONMENT === 'local' && console.debug({ newCrocEnv });
                setCrocEnv(newCrocEnv);
            }
        }
    };
    useEffect(() => {
        setNewCrocEnv();
    }, [
        // signerStatus === 'success',
        crocEnv === undefined,
        chainData.chainId,
        signer,
    ]);
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

    /* ------------------------------------------ END CROC ENV CONTEXT ------------------------------------------ */

    /* ------------------------------------------ CHAIN DATA CONTEXT ------------------------------------------ */
    //  TODO: add to chain data context - modify so that the appChain hook updates when userLoggedIn state changes
    // custom hook to manage chain the app is using
    // `chainData` is data on the current chain retrieved from our SDK
    // `isChainSupported` is a boolean indicating whether the chain is supported by Ambient
    const [lastBlockNumber, setLastBlockNumber] = useState<number>(0);
    const [gasPriceInGwei, setGasPriceinGwei] = useState<number | undefined>();

    const chainDataState = {
        lastBlockNumber,
        setLastBlockNumber,
        gasPriceInGwei,
        setGasPriceinGwei,
    };

    async function pollBlockNum(): Promise<void> {
        // if default RPC is Infura, use key from env variable
        const nodeUrl =
            chainData.nodeUrl.toLowerCase().includes('infura') &&
            process.env.REACT_APP_INFURA_KEY
                ? chainData.nodeUrl.slice(0, -32) +
                  process.env.REACT_APP_INFURA_KEY
                : chainData.nodeUrl;

        return fetch(nodeUrl, {
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
            await pollBlockNum();
            // Don't use polling, useWebSocket (below)
            if (chainData.wsUrl) {
                return;
            }
            // Grab block right away, then poll on periodic basis

            const interval = setInterval(async () => {
                await pollBlockNum();
            }, BLOCK_NUM_POLL_MS);
            return () => clearInterval(interval);
        })();
    }, [chainData.nodeUrl, BLOCK_NUM_POLL_MS]);
    function isJsonString(str: string) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
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
            if (!isJsonString(lastNewHeadMessage.data)) return;
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

    // const everySecondBlock = useMemo(() => Math.floor(lastBlockNumber / 2), [lastBlockNumber]);
    const everyEigthBlock = useMemo(
        () => Math.floor(lastBlockNumber / 8),
        [lastBlockNumber],
    );
    const addTokenInfo = (token: TokenIF): TokenIF => {
        // CONTEXT: should be a helper function
        const oldToken: TokenIF | undefined = tokens.getTokenByAddress(
            token.address,
        );
        const newToken = { ...token };
        newToken.name = oldToken ? oldToken.name : '';
        newToken.logoURI = oldToken ? oldToken.logoURI : '';
        return newToken;
    };
    useEffect(() => {
        (async () => {
            IS_LOCAL_ENV &&
                console.debug('fetching native token and erc20 token balances');
            if (crocEnv && isConnected && userAddress && chainData.chainId) {
                try {
                    const newNativeToken: TokenIF =
                        await cachedFetchNativeTokenBalance(
                            userAddress,
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
                            userAddress,
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
    }, [crocEnv, isConnected, userAddress, chainData.chainId, everyEigthBlock]);

    /* ------------------------------------------ END CHAIN DATA CONTEXT ------------------------------------------ */

    /* ------------------------------------------ USER DATA CONTEXT ------------------------------------------ */
    const { addRecentToken, getRecentTokens } = useRecentTokens(
        chainData.chainId,
    );
    useEffect(() => {
        dispatch(resetUserGraphData());
    }, [userAddress]);

    const userDataState = {
        addRecentToken,
        getRecentTokens,
    };

    /* ------------------------------------------ END USER DATA CONTEXT ------------------------------------------ */

    /* ------------------------------------------ CHART CONTEXT ------------------------------------------ */
    const [fullScreenChart, setFullScreenChart] = useState(false);
    const isChartEnabled =
        !!process.env.REACT_APP_CHART_IS_ENABLED &&
        process.env.REACT_APP_CHART_IS_ENABLED.toLowerCase() === 'false'
            ? false
            : true;
    const chartSettings = useChartSettings();

    const chartState = {
        chartSettings,
        isFullScreen: fullScreenChart,
        setIsFullScreen: setFullScreenChart,
        isEnabled: isChartEnabled,
    };

    useEffect(() => {
        if (!currentLocation.startsWith('/trade')) {
            setFullScreenChart(false);
        }
    }, [currentLocation]);
    /* ------------------------------------------ END CHART CONTEXT ------------------------------------------ */

    /* ------------------------------------------ RANGE CONTEXT ------------------------------------------ */
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

    const rangeState = {
        maxRangePrice,
        setMaxRangePrice,
        minRangePrice,
        setMinRangePrice,
        simpleRangeWidth,
        setSimpleRangeWidth,
        repositionRangeWidth,
        setRepositionRangeWidth,
        rescaleRangeBoundariesWithSlider,
        setRescaleRangeBoundariesWithSlider,
        chartTriggeredBy,
        setChartTriggeredBy,
    };

    /* ------------------------------------------ END RANGE CONTEXT ------------------------------------------ */

    /* ------------------------------------------ TOKEN CONTEXT ------------------------------------------ */
    const tokens: tokenMethodsIF = useTokens(chainData.chainId);

    // CONTEXT: ???
    const [needTokenLists, setNeedTokenLists] = useState(true);
    // trigger a useEffect() which needs to run when new token lists are received
    // true vs false is an arbitrary distinction here
    const [tokenListsReceived, indicateTokenListsReceived] = useState(false);
    if (needTokenLists) {
        IS_LOCAL_ENV && console.debug('fetching token lists');
        setNeedTokenLists(false);
        fetchTokenLists(tokenListsReceived, indicateTokenListsReceived);
    }

    /* ------------------------------------------ END TOKEN CONTEXT ------------------------------------------ */

    /* ------------------------------------------ TRADE TOKEN CONTEXT ------------------------------------------ */
    const {
        tokenAAllowance,
        tokenBAllowance,
        setRecheckTokenAApproval,
        setRecheckTokenBApproval,
    } = useTokenPairAllowance({
        crocEnv,
        userAddress,
        lastBlockNumber,
    });

    const {
        baseTokenAddress,
        quoteTokenAddress,
        mainnetBaseTokenAddress,
        mainnetQuoteTokenAddress,
        baseTokenDecimals,
        quoteTokenDecimals,
        ambientApy,
        dailyVol,
        isTokenABase,
    } = usePoolMetadata({
        crocEnv,
        httpGraphCacheServerDomain,
        pathname: location.pathname,
        chainData,
        searchableTokens: tokens.tokenUniv,
        receiptCount: receiptData.sessionReceipts.length,
        lastBlockNumber,
        isServerEnabled,
        cachedPoolLiquidity,
        setSimpleRangeWidth,
        isChartEnabled,
    });

    const [baseTokenBalance, setBaseTokenBalance] = useState<string>('');
    const [quoteTokenBalance, setQuoteTokenBalance] = useState<string>('');
    const [baseTokenDexBalance, setBaseTokenDexBalance] = useState<string>('');
    const [quoteTokenDexBalance, setQuoteTokenDexBalance] =
        useState<string>('');

    const tradeTokenState = {
        baseToken: {
            address: baseTokenAddress,
            mainnetAddress: mainnetBaseTokenAddress,
            balance: baseTokenBalance,
            dexBalance: baseTokenDexBalance,
            decimals: baseTokenDecimals,
        },
        quoteToken: {
            address: quoteTokenAddress,
            mainnetAddress: mainnetQuoteTokenAddress,
            balance: quoteTokenBalance,
            dexBalance: quoteTokenDexBalance,
            decimals: quoteTokenDecimals,
        },
        tokenAAllowance,
        tokenBAllowance,
        setRecheckTokenAApproval,
        setRecheckTokenBApproval,
        isTokenABase,
    };

    // useEffect to update selected token balances
    useEffect(() => {
        (async () => {
            if (
                crocEnv &&
                userAddress &&
                isConnected &&
                tradeData.baseToken.address &&
                tradeData.quoteToken.address
            ) {
                crocEnv
                    .token(tradeData.baseToken.address)
                    .walletDisplay(userAddress)
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
                    .balanceDisplay(userAddress)
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
                    .walletDisplay(userAddress)
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
                    .balanceDisplay(userAddress)
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
        isConnected,
        userAddress,
        tradeData.baseToken.address,
        tradeData.quoteToken.address,
        lastBlockNumber,
    ]);

    /* ------------------------------------------ END TRADE TOKEN CONTEXT ------------------------------------------ */

    /* ------------------------------------------ POOL CONTEXT ------------------------------------------ */
    const pool = useMemo(
        () =>
            crocEnv?.pool(
                tradeData.baseToken.address,
                tradeData.quoteToken.address,
            ),
        [crocEnv, tradeData.baseToken.address, tradeData.quoteToken.address],
    );

    const {
        isPoolInitialized,
        poolPriceDisplay,
        isPoolPriceChangePositive,
        poolPriceChangePercent,
    } = usePoolPricing({
        crocEnv,
        pathname: location.pathname,
        baseTokenAddress,
        quoteTokenAddress,
        baseTokenDecimals,
        quoteTokenDecimals,
        chainData,
        receiptCount: receiptData.sessionReceipts.length,
        isUserLoggedIn: isConnected,
        isUserIdle,
        lastBlockNumber,
        isServerEnabled,
        cachedQuerySpotPrice,
    });

    const poolState = {
        pool,
        isPoolInitialized,
        poolPriceDisplay,
        isPoolPriceChangePositive,
        poolPriceChangePercent,
        ambientApy,
        dailyVol,
    };

    /* ------------------------------------------ END POOL CONTEXT ------------------------------------------ */

    /* ------------------------------------------ CANDLE CONTEXT ------------------------------------------ */
    const [candleData, setCandleData] = useState<
        CandlesByPoolAndDuration | undefined
    >();
    const [isCandleDataNull, setIsCandleDataNull] = useState(false);
    const [isCandleSelected, setIsCandleSelected] = useState<
        boolean | undefined
    >();
    const [fetchingCandle, setFetchingCandle] = useState(false);
    const [candleDomains, setCandleDomains] = useState<candleDomain>({
        lastCandleDate: undefined,
        domainBoundry: undefined,
    });
    const domainBoundaryInSeconds = Math.floor(
        (candleDomains?.domainBoundry || 0) / 1000,
    );

    const [candleScale, setCandleScale] = useState<candleScale>({
        lastCandleDate: undefined,
        nCandle: 200,
        isFetchForTimeframe: false,
    });

    const candleState = {
        candleData: {
            value: candleData,
            setValue: setCandleData,
        },
        isCandleDataNull: {
            value: isCandleDataNull,
            setValue: setIsCandleDataNull,
        },
        isCandleSelected: {
            value: isCandleSelected,
            setValue: setIsCandleSelected,
        },
        fetchingCandle: {
            value: fetchingCandle,
            setValue: setFetchingCandle,
        },
        candleDomains: {
            value: candleDomains,
            setValue: setCandleDomains,
        },
        candleScale: {
            value: candleScale,
            setValue: setCandleScale,
        },
    };

    // CONTEXT: move to a chart/candle component - does not need to be a context
    // local logic to determine current chart period
    // this is situation-dependant but used in this file
    const candleTimeLocal = useMemo(() => {
        if (
            location.pathname.startsWith('/trade/range') ||
            location.pathname.startsWith('/trade/reposition')
        ) {
            return chartSettings.candleTime.range.time;
        } else {
            return chartSettings.candleTime.market.time;
        }
    }, [
        chartSettings.candleTime.range.time,
        chartSettings.candleTime.market.time,
        location.pathname,
    ]);

    useEffect(() => {
        isChartEnabled && !isUserIdle && fetchCandles();
    }, [
        isChartEnabled,
        mainnetBaseTokenAddress,
        mainnetQuoteTokenAddress,
        isUserIdle,
        candleScale?.isFetchForTimeframe,
    ]);
    const fetchCandles = () => {
        if (
            isServerEnabled &&
            baseTokenAddress &&
            quoteTokenAddress &&
            mainnetBaseTokenAddress &&
            mainnetQuoteTokenAddress &&
            candleTimeLocal
        ) {
            const reqOptions = new URLSearchParams({
                base: mainnetBaseTokenAddress.toLowerCase(),
                quote: mainnetQuoteTokenAddress.toLowerCase(),
                poolIdx: chainData.poolIndex.toString(),
                period: candleTimeLocal.toString(),
                // time: '', // optional
                n: candleScale?.nCandle.toString(), // positive integer
                // page: '0', // nonnegative integer
                chainId: mktDataChainId(chainData.chainId),
                dex: 'all',
                poolStats: 'true',
                concise: 'true',
                poolStatsChainIdOverride: chainData.chainId,
                poolStatsBaseOverride: baseTokenAddress.toLowerCase(),
                poolStatsQuoteOverride: quoteTokenAddress.toLowerCase(),
                poolStatsPoolIdxOverride: chainData.poolIndex.toString(),
            });

            if (candleScale?.lastCandleDate) {
                reqOptions.set('time', candleScale?.lastCandleDate.toString()); // optional
            }

            IS_LOCAL_ENV && console.debug('fetching new candles');
            try {
                if (httpGraphCacheServerDomain) {
                    const candleSeriesCacheEndpoint =
                        httpGraphCacheServerDomain + '/candle_series?';
                    setFetchingCandle(true);
                    fetch(candleSeriesCacheEndpoint + reqOptions)
                        .then((response) => response?.json())
                        .then((json) => {
                            const candles = json?.data;
                            if (candles?.length === 0) {
                                setIsCandleDataNull(true);
                                setExpandTradeTable(true);
                            } else if (candles) {
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
                                setIsCandleDataNull(false);
                                setExpandTradeTable(false);
                            }
                            return candles?.length;
                        })
                        .then((result) => {
                            if (result !== 0) {
                                setFetchingCandle(false);
                            }
                        })
                        .catch(console.error);
                }
            } catch (error) {
                console.error({ error });
            }
        } else {
            setIsCandleDataNull(true);
            // setExpandTradeTable(true);
        }
    };
    const domainBoundaryInSecondsDebounced = useDebounce(
        domainBoundaryInSeconds,
        500,
    );

    const lastCandleDateInSeconds = Math.floor(
        (candleDomains?.lastCandleDate || 0) / 1000,
    );

    const lastCandleDateInSecondsDebounced = useDebounce(
        lastCandleDateInSeconds,
        500,
    );

    const minTimeMemo = useMemo(() => {
        const candleDataLength = candleData?.candles?.length;
        if (!candleDataLength) return;
        // IS_LOCAL_ENV && console.debug({ candleDataLength });

        const lastDate = new Date(
            (candleDomains?.lastCandleDate as number) / 1000,
        ).getTime();

        return lastDate;
    }, [candleData?.candles?.length, lastCandleDateInSecondsDebounced]);

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
                            diffHashSig(
                                candleData.candles[indexOfExistingCandle],
                            ) !== diffHashSig(messageCandle)
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
            fetchCandlesByNumDurations(numDurationsNeeded);
        }
    }, [numDurationsNeeded]);

    /* ------------------------------------------ END CANDLE CONTEXT ------------------------------------------ */

    /* ------------------------------------------ TRADE TABLE CONTEXT ------------------------------------------ */
    const [showAllData, setShowAllData] = useState(true);
    const [currentTxActiveInTransactions, setCurrentTxActiveInTransactions] =
        useState('');
    const [currentPositionActive, setCurrentPositionActive] = useState('');
    const [expandTradeTable, setExpandTradeTable] = useState(true);

    // CONTEXT: investigate
    const [showSwapPulseAnimation, setShowSwapPulseAnimation] = useState(false);
    const [showOrderPulseAnimation, setShowOrderPulseAnimation] =
        useState(false);
    const [showRangePulseAnimation, setShowRangePulseAnimation] =
        useState(false);

    const tradeTableState = {
        showAllData,
        setShowAllData,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        currentPositionActive,
        setCurrentPositionActive,
        expandTradeTable,
        setExpandTradeTable,
        showSwapPulseAnimation,
        setShowSwapPulseAnimation,
        showOrderPulseAnimation,
        setShowOrderPulseAnimation,
        showRangePulseAnimation,
        setShowRangePulseAnimation,
    };

    function toggleTradeTabBasedOnRoute() {
        if (!isCandleSelected) {
            appState.outsideControl.setIsActive(true);
            if (currentLocation.includes('/market')) {
                appState.outsideTab.setSelected(0);
            } else if (currentLocation.includes('/limit')) {
                appState.outsideTab.setSelected(1);
            } else if (
                currentLocation.includes('/range') ||
                currentLocation.includes('reposition') ||
                currentLocation.includes('add')
            ) {
                appState.outsideTab.setSelected(2);
            }
        }
    }

    useEffect(() => {
        if (
            !currentTxActiveInTransactions &&
            !currentPositionActive &&
            location.pathname.includes('/trade')
        )
            toggleTradeTabBasedOnRoute();
    }, [location.pathname]);

    /* ------------------------------------------ END TRADE TABLE CONTEXT ------------------------------------------ */

    /* ------------------------------------------ USER PREFERENCES CONTEXT ------------------------------------------ */
    const userPreferencesProps = {
        favePools: useFavePools(),
        swapSlippage: useSlippage('swap', slippage.swap),
        mintSlippage: useSlippage('mint', slippage.mint),
        repoSlippage: useSlippage('repo', slippage.reposition),
        dexBalSwap: useExchangePrefs('swap'),
        dexBalLimit: useExchangePrefs('limit'),
        dexBalRange: useExchangePrefs('range'),
        bypassConfirmSwap: useSkipConfirm('swap'),
        bypassConfirmLimit: useSkipConfirm('limit'),
        bypassConfirmRange: useSkipConfirm('range'),
        bypassConfirmRepo: useSkipConfirm('repo'),
    };

    // Memoize the object being passed to context. This assumes that all of the individual top-level values
    // in the userPreferencesProps object are themselves correctly memo-ized at the object level. E.g. the
    // value from `useSlippage()` or `useSkipConfirm()` should be a new object reference if and only if their
    // content needs to be updated
    const userPreferences = useMemo(
        () => userPreferencesProps,
        [...Object.values(userPreferencesProps)],
    );

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
            : !tradeData.didUserFlipDenom;

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
    }, [
        tradeData.didUserFlipDenom,
        tokenPair.dataTokenA.address,
        tokenPair.dataTokenA.chainId,
        tokenPair.dataTokenB.address,
        tokenPair.dataTokenB.chainId,
        isBaseTokenMoneynessGreaterOrEqual,
    ]);
    /* ------------------------------------------ END USER PREFERENCES CONTEXT ------------------------------------------ */

    /* ------------------------------------------ SIDEBAR CONTEXT ------------------------------------------ */
    const sidebar = useSidebar(location.pathname);
    // hook to manage recent pool data in-session
    const recentPools: recentPoolsMethodsIF = useRecentPools(
        chainData.chainId,
        tradeData.tokenA,
        tradeData.tokenB,
        tokens,
    );

    // CONTEXT: move into sidebar component
    const poolList = usePoolList(chainData.chainId, chainData.poolIndex);

    const sidebarState = {
        sidebar,
        recentPools,
        poolList,
    };

    useEffect(() => {
        if (lastReceiptHash) {
            IS_LOCAL_ENV && console.debug('new receipt to display');
            appState.snackbar.open(
                lastReceipt
                    ? isLastReceiptSuccess
                        ? `Transaction ${lastReceipt.transactionHash} successfully completed`
                        : `Transaction ${lastReceipt.transactionHash} failed`
                    : '',
                isLastReceiptSuccess ? 'info' : 'warning',
            );
        }
    }, [lastReceiptHash]);

    const showSidebarByDefault = useMediaQuery('(min-width: 1776px)');
    function toggleSidebarBasedOnRoute() {
        if (
            currentLocation === '/' ||
            currentLocation === '/swap' ||
            currentLocation.includes('/account')
        ) {
            sidebarState.sidebar.close();
        } else if (showSidebarByDefault) {
            sidebarState.sidebar.open();
        } else {
            sidebarState.sidebar.close();
        }
    }
    useEffect(() => {
        toggleSidebarBasedOnRoute();
        if (!currentTxActiveInTransactions && !currentPositionActive)
            toggleTradeTabBasedOnRoute();
    }, [location.pathname.includes('/trade')]);

    /* ------------------------------------------ END SIDEBAR CONTEXT ------------------------------------------ */

    // CONTEXT: leave in app.tsx for now, investigate if its being used, and move to another file if necessary - potentially combine
    useEffect(() => {
        if (isConnected) {
            if (userData.isLoggedIn === false && userAddress) {
                IS_LOCAL_ENV && console.debug('settting to logged in');
                dispatch(setIsLoggedIn(true));
                dispatch(setAddressAtLogin(userAddress));
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
    }, [isConnected, userData.isLoggedIn, userAddress]);
    useEffect(() => {
        IS_LOCAL_ENV &&
            console.debug(
                'resetting user token data and address because connected userAddress changed',
            );
        dispatch(resetTokenData());
        if (userAddress) {
            dispatch(setAddressCurrent(userAddress));
        } else {
            dispatch(setAddressCurrent(undefined));
        }
    }, [isConnected, userAddress]);

    // CONTEXT: move inside Portolio
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

    // CONTEXT: helper function
    const isPairStable = useMemo(
        () =>
            isStablePair(
                tradeData.tokenA.address,
                tradeData.tokenB.address,
                chainData.chainId,
            ),
        [tradeData.tokenA.address, tradeData.tokenB.address, chainData.chainId],
    );

    // CONTEXT: remove and setPoolPriceNonDisplay and setLimitTick where it needs to be set
    const [resetLimitTick, setResetLimitTick] = useState(false);
    useEffect(() => {
        if (resetLimitTick) {
            dispatch(setPoolPriceNonDisplay(0));
            dispatch(setLimitTick(undefined));
        }
    }, [resetLimitTick]);

    // CONTEXT: user data context -- ask Ben whether this should really be in user data context - lots of inner dependencies that don't make sense... trade context?
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

    // CONTEXT: move into header component - have contexts listen to logged out and reset
    // function to sever connection between user wallet and the app
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

    // CONTEXT: move this into the header component
    const shouldDisplayAccountTab = isConnected && userAddress !== undefined;

    // CONTEXT: remove and reference as necessary
    const connectedUserErc20Tokens = useAppSelector(
        (state) => state.userData.tokens.erc20Tokens,
    );

    // CONTEXT: helper function
    const importedTokensPlus = useMemo<TokenIF[]>(() => {
        const ambientAddresses: string[] = tokens.defaultTokens.map(
            (tkn: TokenIF) => tkn.address.toLowerCase(),
        );

        const output = tokens.defaultTokens;
        let tokensAdded = 0;
        connectedUserErc20Tokens?.forEach((tkn) => {
            // gatekeep to make sure token is not already in the array,
            // ... that the token can be verified against a known list,
            // ... that user has a positive balance of the token, and
            // ... that the limiter has not been reached
            if (
                !ambientAddresses.includes(tkn.address.toLowerCase()) &&
                tokens.verifyToken(tkn.address) &&
                parseInt(tkn.combinedBalance as string) > 0 &&
                tokensAdded < 4
            ) {
                tokensAdded++;
                output.push({ ...tkn, fromList: 'wallet' });
            }
        });

        // limiter for tokens to add from in-session recent tokens list
        let recentTokensAdded = 0;
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
                recentTokensAdded++;
                output.push(tkn);
            }
        });
        return output;
    }, [
        tokens.defaultTokens,
        chainData.chainId,
        getRecentTokens,
        connectedUserErc20Tokens,
    ]);

    // props for <PageHeader/> React element
    const headerProps = {
        clickLogout,
        shouldDisplayAccountTab,
    };

    // CONTEXT: tbd
    const [outputTokens, validatedInput, setInput, searchType] = useTokenSearch(
        chainData.chainId,
        tokens,
        connectedUserErc20Tokens ?? [],
        getRecentTokens,
    );

    // props for <Swap/> React element
    const swapProps = {
        isPairStable,
        importedTokensPlus,
        outputTokens,
        validatedInput,
        setInput,
        searchType,
    };

    // props for <Swap/> React element on trade route
    const swapPropsTrade = {
        isPairStable: isPairStable,
        isOnTradeRoute: true,
        importedTokensPlus,
        outputTokens,
        validatedInput,
        setInput,
        searchType,
    };

    // props for <Limit/> React element on trade route
    const limitPropsTrade = {
        isPairStable,
        isOnTradeRoute: true,
        setResetLimitTick,
        importedTokensPlus,
        outputTokens,
        validatedInput,
        setInput,
        searchType,
    };

    // props for <Range/> React element
    const rangeProps = {
        isPairStable,
        importedTokensPlus,
        outputTokens,
        validatedInput,
        setInput,
        searchType,
        cachedFetchTokenPrice,
    };

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

    const sidebarDislayStyle = sidebarState.sidebar.isOpen
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

    interface UrlRoutesTemplate {
        swap: string;
        market: string;
        limit: string;
        range: string;
    }

    // CONTEXT: helper function that accepts chainId and returns route
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
            sidebarState.sidebar.toggle(true);
        },
    );
    useKeyboardShortcuts(
        { modifierKeys: ['Shift', 'Control'], key: 'C' },
        () => {
            appState.chat.setIsOpen(!appState.chat.isOpen);
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

    const tradeProps = {
        cachedQuerySpotPrice,
        cachedPositionUpdateQuery,
        limitRate: '',
    };

    const accountProps = {
        cachedQuerySpotPrice,
        cachedPositionUpdateQuery,
        cachedFetchErc20TokenBalances,
        cachedFetchNativeTokenBalance,
        cachedFetchTokenPrice,
        outputTokens,
        validatedInput,
        setInput,
        searchType,
        mainnetProvider,
    };

    const repositionProps = {
        isPairStable,
    };

    const chatProps = {
        isFullScreen: true,
        appPage: true,
    };

    // CONTEXT: likely want to split these guys up to live in their respective contexts
    useWebSocketSubs({
        crocEnv,
        wssGraphCacheServerDomain,
        baseTokenAddress,
        quoteTokenAddress,
        mainnetBaseTokenAddress,
        mainnetQuoteTokenAddress,
        isServerEnabled,
        shouldNonCandleSubscriptionsReconnect,
        areSubscriptionsEnabled,
        tokenUniv: tokens.tokenUniv,
        chainData,
        lastBlockNumber,
        candleData,
        setCandleData,
        candleTimeLocal,
        userAddress,
        shouldCandleSubscriptionsReconnect,
    });

    return (
        <AppStateContext.Provider value={appState}>
            <CrocEnvContext.Provider value={crocEnvState}>
                <ChainDataContext.Provider value={chainDataState}>
                    <UserDataContext.Provider value={userDataState}>
                        <TokenContext.Provider value={tokens}>
                            <TradeTokenContext.Provider value={tradeTokenState}>
                                <PoolContext.Provider value={poolState}>
                                    <TradeTableContext.Provider
                                        value={tradeTableState}
                                    >
                                        <UserPreferenceContext.Provider
                                            value={userPreferences}
                                        >
                                            <SidebarContext.Provider
                                                value={sidebarState}
                                            >
                                                <div
                                                    className={containerStyle}
                                                    data-theme={
                                                        appState.theme.selected
                                                    }
                                                >
                                                    <AppOverlay />
                                                    {currentLocation !==
                                                        '/404' && (
                                                        <PageHeader
                                                            {...headerProps}
                                                        />
                                                    )}
                                                    <section
                                                        className={`${showSidebarOrNullStyle} ${swapBodyStyle}`}
                                                    >
                                                        {!currentLocation.startsWith(
                                                            '/swap',
                                                        ) && sidebarRender}
                                                        <Routes>
                                                            <Route
                                                                index
                                                                element={
                                                                    <Home
                                                                        cachedQuerySpotPrice={
                                                                            cachedQuerySpotPrice
                                                                        }
                                                                        cachedPoolStatsFetch={
                                                                            cachedPoolStatsFetch
                                                                        }
                                                                    />
                                                                }
                                                            />
                                                            <Route
                                                                path='accessibility'
                                                                element={
                                                                    <Accessibility />
                                                                }
                                                            />
                                                            <Route
                                                                path='trade'
                                                                element={
                                                                    <RangeContext.Provider
                                                                        value={
                                                                            rangeState
                                                                        }
                                                                    >
                                                                        <CandleContext.Provider
                                                                            value={
                                                                                candleState
                                                                            }
                                                                        >
                                                                            <ChartContext.Provider
                                                                                value={
                                                                                    chartState
                                                                                }
                                                                            >
                                                                                <Trade
                                                                                    {...tradeProps}
                                                                                />
                                                                            </ChartContext.Provider>
                                                                        </CandleContext.Provider>
                                                                    </RangeContext.Provider>
                                                                }
                                                            >
                                                                <Route
                                                                    path=''
                                                                    element={
                                                                        <Navigate
                                                                            to='/trade/market'
                                                                            replace
                                                                        />
                                                                    }
                                                                />
                                                                <Route
                                                                    path='market'
                                                                    element={
                                                                        <Navigate
                                                                            to={
                                                                                defaultUrlParams.market
                                                                            }
                                                                            replace
                                                                        />
                                                                    }
                                                                />
                                                                <Route
                                                                    path='market/:params'
                                                                    element={
                                                                        <Swap
                                                                            {...swapPropsTrade}
                                                                        />
                                                                    }
                                                                />
                                                                <Route
                                                                    path='limit'
                                                                    element={
                                                                        <Navigate
                                                                            to={
                                                                                defaultUrlParams.limit
                                                                            }
                                                                            replace
                                                                        />
                                                                    }
                                                                />
                                                                <Route
                                                                    path='limit/:params'
                                                                    element={
                                                                        <Limit
                                                                            {...limitPropsTrade}
                                                                        />
                                                                    }
                                                                />
                                                                <Route
                                                                    path='range'
                                                                    element={
                                                                        <Navigate
                                                                            to={
                                                                                defaultUrlParams.range
                                                                            }
                                                                            replace
                                                                        />
                                                                    }
                                                                />
                                                                <Route
                                                                    path='range/:params'
                                                                    element={
                                                                        <RangeContext.Provider
                                                                            value={
                                                                                rangeState
                                                                            }
                                                                        >
                                                                            <Range
                                                                                {...rangeProps}
                                                                            />
                                                                        </RangeContext.Provider>
                                                                    }
                                                                />
                                                                <Route
                                                                    path='reposition'
                                                                    element={
                                                                        <Navigate
                                                                            to={
                                                                                defaultUrlParams.range
                                                                            }
                                                                            replace
                                                                        />
                                                                    }
                                                                />
                                                                <Route
                                                                    path='reposition/:params'
                                                                    element={
                                                                        <RangeContext.Provider
                                                                            value={
                                                                                rangeState
                                                                            }
                                                                        >
                                                                            <Reposition
                                                                                {...repositionProps}
                                                                            />
                                                                        </RangeContext.Provider>
                                                                    }
                                                                />
                                                                <Route
                                                                    path='edit/'
                                                                    element={
                                                                        <Navigate
                                                                            to='/trade/market'
                                                                            replace
                                                                        />
                                                                    }
                                                                />
                                                            </Route>
                                                            <Route
                                                                path='chat'
                                                                element={
                                                                    <ChatPanel
                                                                        {...chatProps}
                                                                    />
                                                                }
                                                            />

                                                            <Route
                                                                path='chat/:params'
                                                                element={
                                                                    <ChatPanel
                                                                        {...chatProps}
                                                                    />
                                                                }
                                                            />
                                                            <Route
                                                                path='initpool/:params'
                                                                element={
                                                                    <InitPool
                                                                        isUserLoggedIn={
                                                                            isConnected
                                                                        }
                                                                        openModalWallet={
                                                                            openWagmiModalWallet
                                                                        }
                                                                        tokenAAllowance={
                                                                            tokenAAllowance
                                                                        }
                                                                        tokenBAllowance={
                                                                            tokenBAllowance
                                                                        }
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
                                                                        userAccount={
                                                                            true
                                                                        }
                                                                    />
                                                                }
                                                            />
                                                            <Route
                                                                path='account/:address'
                                                                element={
                                                                    <Portfolio
                                                                        {...accountProps}
                                                                        userAccount={
                                                                            false
                                                                        }
                                                                    />
                                                                }
                                                            />

                                                            <Route
                                                                path='swap'
                                                                element={
                                                                    <Navigate
                                                                        replace
                                                                        to={
                                                                            defaultUrlParams.swap
                                                                        }
                                                                    />
                                                                }
                                                            />
                                                            <Route
                                                                path='swap/:params'
                                                                element={
                                                                    <Swap
                                                                        {...swapProps}
                                                                    />
                                                                }
                                                            />
                                                            <Route
                                                                path='tos'
                                                                element={
                                                                    <TermsOfService />
                                                                }
                                                            />
                                                            {IS_LOCAL_ENV && (
                                                                <Route
                                                                    path='testpage'
                                                                    element={
                                                                        <TestPage />
                                                                    }
                                                                />
                                                            )}
                                                            <Route
                                                                path='/:address'
                                                                element={
                                                                    <Portfolio
                                                                        {...accountProps}
                                                                        userAccount={
                                                                            false
                                                                        }
                                                                    />
                                                                }
                                                            />
                                                            <Route
                                                                path='/404'
                                                                element={
                                                                    <NotFound />
                                                                }
                                                            />
                                                        </Routes>
                                                    </section>
                                                </div>
                                                <div className='footer_container'>
                                                    {currentLocation !== '/' &&
                                                        !currentLocation.includes(
                                                            '/chat',
                                                        ) &&
                                                        appState.chat
                                                            .isEnabled && (
                                                            <ChatPanel
                                                                isFullScreen={
                                                                    false
                                                                }
                                                            />
                                                        )}
                                                </div>
                                                <SidebarFooter />
                                                <GlobalModal />
                                                <GlobalPopup />
                                                <SnackbarComponent />
                                                <WalletModalWagmi />
                                            </SidebarContext.Provider>
                                        </UserPreferenceContext.Provider>
                                    </TradeTableContext.Provider>
                                </PoolContext.Provider>
                            </TradeTokenContext.Provider>
                        </TokenContext.Provider>
                    </UserDataContext.Provider>
                </ChainDataContext.Provider>
            </CrocEnvContext.Provider>
        </AppStateContext.Provider>
    );
}
