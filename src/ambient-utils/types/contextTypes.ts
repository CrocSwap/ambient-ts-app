import { CrocEnv, CrocPoolView } from '@crocswap-libs/sdk';
import { Provider } from 'ethers';
import { Dispatch, SetStateAction } from 'react';
import { globalPopupMethodsIF } from '../../App/components/GlobalPopup/useGlobalPopup';
import { chartSettingsMethodsIF } from '../../App/hooks/useChartSettings';
import { recentPoolsMethodsIF } from '../../App/hooks/useRecentPools';
import { getRecentTokensParamsIF } from '../../App/hooks/useRecentTokens';
import { sidebarMethodsIF } from '../../App/hooks/useSidebar';
import { skins } from '../../App/hooks/useSkin';
import { tokenMethodsIF } from '../../App/hooks/useTokens';
import { fontSets } from '../../assets/branding/types';
import { snackbarMethodsIF } from '../../components/Global/SnackbarComponent/useSnackbar';

import { dexBalanceMethodsIF } from '../../App/hooks/useExchangePrefs';
import { favePoolsMethodsIF } from '../../App/hooks/useFavePools';
import { skipConfirmIF } from '../../App/hooks/useSkipConfirm';
import { SlippageMethodsIF } from '../../App/hooks/useSlippage';
import { UserAvatarDataIF } from '../../components/Chat/ChatIFs';
import {
    drawDataHistory,
    selectedDrawnData,
} from '../../pages/platformAmbient/Chart/ChartUtils/chartUtils';
import {
    actionKeyIF,
    actionStackIF,
} from '../../pages/platformAmbient/Chart/ChartUtils/useUndoRedo';
import { useTokenStatsIF } from '../../pages/platformAmbient/Explore/useTokenStats';
import { auctionSorts } from '../../pages/platformFuta/Auctions/useSortedAuctions';
import { tickerWatchlistIF } from '../../pages/platformFuta/useTickerWatchlist';
import {
    AmbientListBalancesQueryFn,
    DexBalancesQueryFn,
    FetchAddrFn,
    FetchBlockTimeFn,
    FetchContractDetailsFn,
    FetchTopPairedTokenFn,
    LiquidityDataIF,
    RpcNodeStatus,
    TokenPriceFn,
} from '../api';
import { NFTQueryFn } from '../api/fetchNft';
import {
    AllPoolStatsFn,
    AuctionDataIF,
    AuctionStatusQueryFn,
    Change24Fn,
    GlobalAuctionListQueryFn,
    LiquidityFeeFn,
    PoolStatsFn,
    SpotPriceFn,
    UserAuctionListQueryFn,
} from '../dataLayer';
import {
    AccountDataIF,
    AuctionsDataIF,
    AuctionStatusDataIF,
} from './auctionsTypes';
import {
    CandleDomainIF,
    CandlesByPoolAndDurationIF,
    CandleScaleIF,
} from './candleData';
import { chainHexIds } from './chainHexIds';
import { LimitOrderIF } from './limitOrder';
import { NetworkIF } from './NetworkIF';
import { PoolDataIF, PoolIF, PoolStatIF, SinglePoolDataIF } from './pool';
import { PositionIF } from './position';
import { TokenIF } from './token';
import { TransactionIF } from './transaction';
import { AllVaultsServerIF, UserVaultsServerIF } from './vaults';
import { BlastUserXpIF, UserXpIF } from './xp';

export interface AppStateContextIF {
    appOverlay: { isActive: boolean; setIsActive: (val: boolean) => void };
    appHeaderDropdown: {
        isActive: boolean;
        setIsActive: (val: boolean) => void;
    };
    globalPopup: globalPopupMethodsIF;
    snackbar: snackbarMethodsIF;
    tutorial: { isActive: boolean; setIsActive: (val: boolean) => void };
    chat: {
        isOpen: boolean;
        setIsOpen: (val: boolean) => void;
        isEnabled: boolean;
        setIsEnabled: (val: boolean) => void;
    };
    server: { isEnabled: boolean };
    isUserOnline: boolean;
    subscriptions: { isEnabled: boolean };
    walletModal: {
        isOpen: boolean;
        open: () => void;
        close: () => void;
    };
    isUserIdle: boolean;
    isUserIdle20min: boolean;
    activeNetwork: NetworkIF;
    chooseNetwork: (network: NetworkIF) => void;
    layout: {
        contentHeight: number;
        viewportHeight: number;
    };
}

export interface ExploreContextIF {
    pools: {
        all: Array<PoolDataIF>;
        getAll: (poolList: PoolIF[], crocEnv: CrocEnv, chainId: string) => void;

        reset: () => void;
    };
    topTokensOnchain: useTokenStatsIF;
    isExploreDollarizationEnabled: boolean;
    setIsExploreDollarizationEnabled: Dispatch<SetStateAction<boolean>>;
}

export interface PoolContextIF {
    poolList: PoolIF[];
    pool: CrocPoolView | undefined;
    isPoolInitialized: boolean | undefined;
    poolPriceDisplay: number | undefined;
    isPoolPriceChangePositive: boolean;
    poolPriceChangePercent: string | undefined;
    dailyVol: number | undefined;
    poolData: PoolStatIF;
    usdPrice: number | undefined;
    usdPriceInverse: number | undefined;
    isTradeDollarizationEnabled: boolean;
    setIsTradeDollarizationEnabled: Dispatch<SetStateAction<boolean>>;
    fdvOfDenomTokenDisplay: string | undefined;
    baseTokenFdvDisplay: string | undefined;
    quoteTokenFdvDisplay: string | undefined;
}

export interface AuctionsContextIF {
    globalAuctionList: AuctionsDataIF;
    setFilteredAuctionList: Dispatch<
        SetStateAction<AuctionDataIF[] | undefined>
    >;
    filteredAuctionList: AuctionDataIF[] | undefined;
    accountData: AccountDataIF;
    updateUserAuctionsList(address: string): void;
    updateGlobalAuctionsList(): void;
    getFreshAuctionData(ticker: string): void;
    freshAuctionStatusData: AuctionStatusDataIF;
    isLoading: boolean;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
    showComments: boolean;
    setShowComments: Dispatch<SetStateAction<boolean>>;
    tickerInput: string;
    setTickerInput: Dispatch<SetStateAction<string>>;
    selectedTicker: string | undefined;
    hoveredTicker: string | undefined;
    setHoveredTicker: Dispatch<SetStateAction<string | undefined>>;
    setSelectedTicker: Dispatch<SetStateAction<string | undefined>>;
    watchlists: {
        v1: tickerWatchlistIF;
        shouldDisplay: boolean;
        show: () => void;
        unshow: () => void;
        toggle: () => void;
    };
    showComplete: boolean;
    setShowComplete: Dispatch<SetStateAction<boolean>>;
}

export interface SidebarContextIF {
    recentPools: recentPoolsMethodsIF;
    sidebar: sidebarMethodsIF;
    hideOnMobile: boolean;
    toggleMobileModeVisibility: () => void;
    setIsPoolDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isPoolDropdownOpen: boolean;
}

export const PREMIUM_THEMES_IN_ENV = {
    theme1: 'VITE_THEME_1_ACCOUNTS',
    theme2: 'VITE_THEME_2_ACCOUNTS',
};

export type premiumThemes = keyof typeof PREMIUM_THEMES_IN_ENV;

export interface BrandContextIF {
    skin: {
        active: skins;
        available: skins[];
        set: (s: skins) => void;
    };
    fontSet: fontSets;
    colorAndFont: string;
    platformName: string;
    networks: chainHexIds[];
    headerImage: string;
    showPoints: boolean;
    showDexStats: boolean;
    premium: Record<premiumThemes, boolean>;
    includeCanto: boolean;
    cobrandingLogo: string | undefined;
}

export interface CachedDataContextIF {
    cachedFetchAmbientListWalletBalances: AmbientListBalancesQueryFn;
    cachedFetchDexBalances: DexBalancesQueryFn;
    cachedFetchTokenPrice: TokenPriceFn;
    cachedPoolStatsFetch: PoolStatsFn;
    cachedAllPoolStatsFetch: AllPoolStatsFn;
    cachedGet24hChange: Change24Fn;
    cachedGetLiquidityFee: LiquidityFeeFn;
    cachedGetGlobalAuctionsList: GlobalAuctionListQueryFn;
    cachedGetAuctionStatus: AuctionStatusQueryFn;
    cachedGetUserAuctionsList: UserAuctionListQueryFn;
    cachedQuerySpotPrice: SpotPriceFn;
    cachedQuerySpotTick: SpotPriceFn;
    cachedTokenDetails: FetchContractDetailsFn;
    cachedEnsResolve: FetchAddrFn;
    cachedFetchTopPairedToken: FetchTopPairedTokenFn;
    cachedFetchBlockTime: FetchBlockTimeFn;
    cachedFetchNFT: NFTQueryFn;
}

export interface CandleContextIF {
    candleData: CandlesByPoolAndDurationIF | undefined;
    setCandleData: Dispatch<
        SetStateAction<CandlesByPoolAndDurationIF | undefined>
    >;

    isManualCandleFetchRequested: boolean;
    setIsManualCandleFetchRequested: Dispatch<SetStateAction<boolean>>;
    isCandleSelected: boolean | undefined;
    setIsCandleSelected: Dispatch<SetStateAction<boolean | undefined>>;
    isFetchingCandle: boolean;
    setIsFetchingCandle: Dispatch<SetStateAction<boolean>>;
    candleDomains: CandleDomainIF;
    setCandleDomains: Dispatch<SetStateAction<CandleDomainIF>>;
    candleScale: CandleScaleIF;
    setCandleScale: Dispatch<SetStateAction<CandleScaleIF>>;
    candleTimeLocal: number | undefined;
    timeOfEndCandle: number | undefined;
    isCondensedModeEnabled: boolean;
    setIsCondensedModeEnabled: Dispatch<SetStateAction<boolean>>;
    showFutaCandles: boolean;
    setShowFutaCandles: Dispatch<SetStateAction<boolean>>;
}

export interface ChainDataContextIF {
    gasPriceInGwei: number | undefined;
    setGasPriceinGwei: Dispatch<SetStateAction<number | undefined>>;
    lastBlockNumber: number;
    setLastBlockNumber: Dispatch<SetStateAction<number>>;
    rpcNodeStatus: RpcNodeStatus;
    connectedUserXp: UserXpDataIF;
    connectedUserBlastXp: BlastUserXpDataIF;
    isActiveNetworkBlast: boolean;
    isActiveNetworkPlume: boolean;
    isActiveNetworkSwell: boolean;
    isActiveNetworkBase: boolean;
    isActiveNetworkScroll: boolean;
    isActiveNetworkMainnet: boolean;
    isVaultSupportedOnNetwork: boolean;
    isActiveNetworkL2: boolean;
    nativeTokenUsdPrice: number | undefined;
    allPoolStats: SinglePoolDataIF[] | undefined;
    allVaultsData: AllVaultsServerIF[] | null | undefined;
    setAllVaultsData: Dispatch<
        SetStateAction<AllVaultsServerIF[] | null | undefined>
    >;
    totalTvlString: string | undefined;
    totalVolumeString: string | undefined;
    totalFeesString: string | undefined;
}

export interface ChartHeights {
    current: number;
    saved: number;
    min: number;
    max: number;
    default: number;
}
export type TradeTableState = 'Expanded' | 'Collapsed' | undefined;

export interface ChartContextIF {
    chartSettings: chartSettingsMethodsIF;
    isFullScreen: boolean;
    setIsFullScreen: (val: boolean) => void;
    setChartHeight: (val: number) => void;
    chartHeights: ChartHeights;
    isEnabled: boolean;
    canvasRef: React.MutableRefObject<null>;
    chartCanvasRef: React.MutableRefObject<null>;
    tradeTableState: TradeTableState;
    isMagnetActive: { value: boolean };
    setIsMagnetActive: React.Dispatch<{ value: boolean }>;
    isChangeScaleChart: boolean;
    setIsChangeScaleChart: React.Dispatch<boolean>;
    isCandleDataNull: boolean;
    setNumCandlesFetched: React.Dispatch<{
        candleCount: number | undefined;
        switchPeriodFlag: boolean;
    }>;
    numCandlesFetched: {
        candleCount: number | undefined;
        switchPeriodFlag: boolean;
    };
    setIsCandleDataNull: Dispatch<SetStateAction<boolean>>;
    isToolbarOpen: boolean;
    setIsToolbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    undoRedoOptions: {
        undo: () => void;
        redo: () => void;
        deleteItem: (item: drawDataHistory) => void;
        currentPool: TradeDataContextIF;
        drawnShapeHistory: drawDataHistory[];
        setDrawnShapeHistory: React.Dispatch<SetStateAction<drawDataHistory[]>>;
        drawActionStack: Map<actionKeyIF, actionStackIF[]>;
        actionKey: actionKeyIF;
        addDrawActionStack: (
            tempLastData: drawDataHistory,
            isNewShape: boolean,
            type: string,
            updatedData?: drawDataHistory | undefined,
        ) => void;
        undoStack: Map<actionKeyIF, actionStackIF[]>;
        deleteAllShapes: () => void;
        currentPoolDrawnShapes: drawDataHistory[];
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toolbarRef: React.MutableRefObject<any>;
    activeDrawingType: string;
    setActiveDrawingType: React.Dispatch<SetStateAction<string>>;
    selectedDrawnShape: selectedDrawnData | undefined;
    setSelectedDrawnShape: React.Dispatch<
        SetStateAction<selectedDrawnData | undefined>
    >;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chartContainerOptions: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setChartContainerOptions: React.Dispatch<SetStateAction<any>>;
    isChartHeightMinimum: boolean;
    setIsChartHeightMinimum: React.Dispatch<SetStateAction<boolean>>;
    isMagnetActiveLocal: boolean;
    setIsMagnetActiveLocal: React.Dispatch<SetStateAction<boolean>>;
    setChartThemeColors: React.Dispatch<
        SetStateAction<ChartThemeIF | undefined>
    >;
    chartThemeColors: ChartThemeIF | undefined;
    setColorChangeTrigger: React.Dispatch<SetStateAction<boolean>>;
    colorChangeTrigger: boolean;
    defaultChartSettings: LocalChartSettingsIF;
    setContextmenu: React.Dispatch<SetStateAction<boolean>>;
    contextmenu: boolean;
    setShouldResetBuffer: React.Dispatch<SetStateAction<boolean>>;
    shouldResetBuffer: boolean;
    contextMenuPlacement:
        | {
              top: number;
              left: number;
              isReversed: boolean;
          }
        | undefined;
    setContextMenuPlacement: React.Dispatch<
        SetStateAction<
            | {
                  top: number;
                  left: number;
                  isReversed: boolean;
              }
            | undefined
        >
    >;
}

export interface ChartThemeIF {
    // candle color
    upCandleBodyColor: d3.RGBColor | d3.HSLColor | null;
    downCandleBodyColor: d3.RGBColor | d3.HSLColor | null;
    upCandleBorderColor: d3.RGBColor | d3.HSLColor | null;
    downCandleBorderColor: d3.RGBColor | d3.HSLColor | null;

    selectedDateFillColor: d3.RGBColor | d3.HSLColor | null;

    // liq Color
    liqAskColor: d3.RGBColor | d3.HSLColor | null;
    liqBidColor: d3.RGBColor | d3.HSLColor | null;

    // drawing color
    drawngShapeDefaultColor: d3.RGBColor | d3.HSLColor | null;

    selectedDateStrokeColor: d3.RGBColor | d3.HSLColor | null;
    text2: d3.RGBColor | d3.HSLColor | null;
    accent1: d3.RGBColor | d3.HSLColor | null;
    accent3: d3.RGBColor | d3.HSLColor | null;
    dark1: d3.RGBColor | d3.HSLColor | null;
    textColor: string;

    [key: string]: d3.RGBColor | d3.HSLColor | string | null;
}

export interface LocalChartSettingsIF {
    chartColors: {
        upCandleBodyColor: string;
        downCandleBodyColor: string;
        selectedDateFillColor: string;
        upCandleBorderColor: string;
        downCandleBorderColor: string;
        liqAskColor: string;
        liqBidColor: string;
        selectedDateStrokeColor: string;
        textColor: string;
    };
    isTradeDollarizationEnabled: boolean;
    showVolume: boolean;
    showTvl: boolean;
    showFeeRate: boolean;
}

export interface UrlRoutesTemplateIF {
    swap: string;
    market: string;
    limit: string;
    pool: string;
}

export interface CrocEnvContextIF {
    crocEnv: CrocEnv | undefined;
    setCrocEnv: (val: CrocEnv | undefined) => void;
    topPools: PoolIF[];
    ethMainnetUsdPrice: number | undefined;
    defaultUrlParams: UrlRoutesTemplateIF;
    provider: Provider;
    mainnetProvider: Provider | undefined;
    scrollProvider: Provider | undefined;
    blastProvider: Provider | undefined;
}

export interface DataLoadingContextIF {
    isConnectedUserTxDataLoading: boolean;
    isConnectedUserOrderDataLoading: boolean;
    isConnectedUserPoolOrderDataLoading: boolean;
    isConnectedUserPoolTxDataLoading: boolean;
    isConnectedUserRangeDataLoading: boolean;
    isConnectedUserPoolRangeDataLoading: boolean;
    isLookupUserTxDataLoading: boolean;
    isLookupUserOrderDataLoading: boolean;
    isLookupUserRangeDataLoading: boolean;
    isPoolTxDataLoading: boolean;
    isPoolOrderDataLoading: boolean;
    isPoolRangeDataLoading: boolean;
    isCandleDataLoading: boolean;
    setDataLoadingStatus: (params: {
        datasetName: keyof DataLoadingContextIF;
        loadingStatus: boolean;
    }) => void;
    resetPoolDataLoadingStatus: () => void;
    resetConnectedUserDataLoadingStatus: () => void;
}

export interface Changes {
    dataReceived: boolean;
    changes: Array<TransactionIF>;
}

export interface PositionsByUser {
    dataReceived: boolean;
    positions: Array<PositionIF>;
}
export interface LimitOrdersByUser {
    dataReceived: boolean;
    limitOrders: LimitOrderIF[];
}
export interface PositionsByPool {
    dataReceived: boolean;
    positions: Array<PositionIF>;
}
export interface LimitOrdersByPool {
    dataReceived: boolean;
    limitOrders: LimitOrderIF[];
}
export interface PoolRequestParams {
    baseAddress: string;
    quoteAddress: string;
    poolIndex: number;
    chainId: string;
}

export interface GraphDataContextIF {
    positionsByUser: PositionsByUser;
    limitOrdersByUser: LimitOrdersByUser;
    transactionsByUser: Changes;
    userTransactionsByPool: Changes;
    unindexedNonFailedSessionTransactionHashes: string[];
    unindexedNonFailedSessionPositionUpdates: PositionUpdateIF[];
    unindexedNonFailedSessionLimitOrderUpdates: PositionUpdateIF[];
    transactionsByPool: Changes;
    userPositionsByPool: PositionsByPool;
    positionsByPool: PositionsByPool;
    userLimitOrdersByPool: LimitOrdersByPool;
    limitOrdersByPool: LimitOrdersByPool;
    liquidityData: LiquidityDataIF | undefined;
    liquidityFee: number | undefined;

    setLiquidity: (
        liqData: LiquidityDataIF,
        request: PoolRequestParams | undefined,
    ) => void;
    setLiquidityFee: React.Dispatch<React.SetStateAction<number | undefined>>;
    setTransactionsByPool: React.Dispatch<React.SetStateAction<Changes>>;
    setTransactionsByUser: React.Dispatch<React.SetStateAction<Changes>>;
    setUserTransactionsByPool: React.Dispatch<React.SetStateAction<Changes>>;
    setUserPositionsByPool: React.Dispatch<
        React.SetStateAction<PositionsByPool>
    >;
    setPositionsByPool: React.Dispatch<React.SetStateAction<PositionsByPool>>;
    setUserLimitOrdersByPool: React.Dispatch<
        React.SetStateAction<LimitOrdersByPool>
    >;
    setLimitOrdersByPool: React.Dispatch<
        React.SetStateAction<LimitOrdersByPool>
    >;
    resetUserGraphData: () => void;
}

export interface RangeContextIF {
    rangeTicksCopied: boolean;
    setRangeTicksCopied: Dispatch<SetStateAction<boolean>>;
    maxRangePrice: number;
    setMaxRangePrice: Dispatch<SetStateAction<number>>;
    minRangePrice: number;
    setMinRangePrice: Dispatch<SetStateAction<number>>;
    simpleRangeWidth: number;
    setSimpleRangeWidth: Dispatch<SetStateAction<number>>;
    rescaleRangeBoundariesWithSlider: boolean;
    setRescaleRangeBoundariesWithSlider: Dispatch<SetStateAction<boolean>>;
    chartTriggeredBy: string;
    setChartTriggeredBy: Dispatch<SetStateAction<string>>;
    currentRangeInReposition: string;
    setCurrentRangeInReposition: Dispatch<SetStateAction<string>>;
    currentRangeInAdd: string;
    setCurrentRangeInAdd: Dispatch<SetStateAction<string>>;
    advancedMode: boolean;
    advancedLowTick: number;
    advancedHighTick: number;
    setAdvancedMode: Dispatch<SetStateAction<boolean>>;
    setAdvancedLowTick: Dispatch<SetStateAction<number>>;
    setAdvancedHighTick: Dispatch<SetStateAction<number>>;
    isLinesSwitched: boolean | undefined;
    setIsLinesSwitched: Dispatch<SetStateAction<boolean | undefined>>;
}

export interface TransactionByType {
    userAddress: string;
    txHash: string;
    txAction?:
        | 'Sell'
        | 'Buy'
        | 'Add'
        | 'Remove'
        | 'Harvest'
        | 'Claim'
        | 'Reposition';
    txType:
        | 'Market'
        | 'Limit'
        | 'Range'
        | 'Deposit'
        | 'Withdraw'
        | 'Transfer'
        | 'Init'
        | 'Approve';
    txDescription: string;
    txDetails?: {
        baseAddress: string;
        quoteAddress: string;
        poolIdx: number;
        baseSymbol?: string;
        quoteSymbol?: string;
        baseTokenDecimals?: number;
        quoteTokenDecimals?: number;
        isAmbient?: boolean;
        lowTick?: number;
        highTick?: number;
        isBid?: boolean;
        gridSize?: number;
        originalLowTick?: number;
        originalHighTick?: number;
    };
}

export interface ReceiptContextIF {
    sessionReceipts: Array<string>;
    allReceipts: Array<string>;
    pendingTransactions: Array<string>;
    transactionsByType: Array<TransactionByType>;
    sessionPositionUpdates: PositionUpdateIF[];
    addTransactionByType: (txByType: TransactionByType) => void;
    addReceipt: (receipt: string) => void;
    addPendingTx: (tx: string) => void;
    addPositionUpdate: (positionUpdate: PositionUpdateIF) => void;
    updateTransactionHash: (oldHash: string, newHash: string) => void;
    removePendingTx: (pendingTx: string) => void;
    removeReceipt: (txHash: string) => void;
    resetReceiptData: () => void;
}

export interface PositionUpdateIF {
    positionID: string;
    isLimit: boolean;
    isFullRemoval?: boolean;
    txHash?: string;
    unixTimeAdded?: number;
    unixTimeIndexed?: number;
    unixTimeReceipt?: number;
}

export interface NftListByChain {
    chainId: string;
    totalNFTCount: number;
    userHasNFT: boolean;
    data: Array<NftDataIF>;
}

export interface NftDataIF {
    contractAddress: string;
    contractName: string;
    thumbnailUrl: string;
    cachedUrl: string;
    isAutoGenerated?: boolean;
}

export interface NftFetchSettingsIF {
    pageKey: string;
    pageSize: number;
}

export interface TokenBalanceContextIF {
    tokenBalances: TokenIF[] | undefined;
    resetTokenBalances: () => void;
    setTokenBalance: (params: {
        tokenAddress: string;
        walletBalance?: string | undefined;
        dexBalance?: string | undefined;
    }) => void;
    setTokenBalances: React.Dispatch<
        React.SetStateAction<TokenIF[] | undefined>
    >;
    NFTData: NftListByChain[] | undefined;
    setNFTData: React.Dispatch<
        React.SetStateAction<NftListByChain[] | undefined>
    >;
    NFTFetchSettings: NftFetchSettingsIF;
    setNFTFetchSettings: React.Dispatch<
        React.SetStateAction<NftFetchSettingsIF>
    >;
}

export interface TokenContextIF {
    tokens: tokenMethodsIF;
    outputTokens: TokenIF[];
    rawInput: string;
    validatedInput: string;
    setInput: (val: string) => void;
    searchType: string;
    addRecentToken: (tkn: TokenIF) => void;
    getRecentTokens: (options?: getRecentTokensParamsIF) => TokenIF[];
    addTokenInfo: (token: TokenIF) => TokenIF;
}

export interface TradeDataContextIF {
    tokenA: TokenIF;
    tokenB: TokenIF;
    baseToken: TokenIF;
    quoteToken: TokenIF;
    areDefaultTokensUpdatedForChain: boolean;
    isTokenABase: boolean;
    isDenomBase: boolean;
    didUserFlipDenom: boolean;
    isTokenAPrimary: boolean;
    soloToken: TokenIF;
    shouldSwapDirectionReverse: boolean;
    primaryQuantity: string;
    limitTick: number | undefined;
    poolPriceNonDisplay: number;
    currentPoolPriceTick: number;
    slippageTolerance: number;

    setTokenA: Dispatch<SetStateAction<TokenIF>>;
    setTokenB: Dispatch<SetStateAction<TokenIF>>;
    setDenomInBase: Dispatch<SetStateAction<boolean>>;
    setIsTokenAPrimary: Dispatch<SetStateAction<boolean>>;
    setDidUserFlipDenom: Dispatch<SetStateAction<boolean>>;
    toggleDidUserFlipDenom: () => void;
    setSoloToken: Dispatch<SetStateAction<TokenIF>>;
    setShouldSwapDirectionReverse: Dispatch<SetStateAction<boolean>>;
    setPrimaryQuantity: Dispatch<SetStateAction<string>>;
    setLimitTick: Dispatch<SetStateAction<number | undefined>>;
    setPoolPriceNonDisplay: Dispatch<SetStateAction<number>>;
    setSlippageTolerance: Dispatch<SetStateAction<number>>;
    defaultRangeWidthForActivePool: number;
    getDefaultRangeWidthForTokenPair: (
        chainId: string,
        baseAddress: string,
        quoteAddress: string,
    ) => number;
    noGoZoneBoundaries: number[];
    setNoGoZoneBoundaries: Dispatch<SetStateAction<number[]>>;
    blackListedTimeParams: Map<string, Set<number>>;
    addToBlackList: (tokenPair: string, timeParam: number) => void;
}

export interface TradeTableContextIF {
    showOrderPulseAnimation: boolean;
    showRangePulseAnimation: boolean;
    showSwapPulseAnimation: boolean;
    currentPositionActive: string;
    setCurrentPositionActive: (val: string) => void;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: (val: string) => void;
    currentLimitOrderActive: string;
    setCurrentLimitOrderActive: (val: string) => void;
    toggleTradeTable: () => void;
    toggleTradeTableCollapse: () => void;
    showAllData: boolean;
    setShowAllData: (val: boolean) => void;
    selectedOutsideTab: number;
    setSelectedOutsideTab: (val: number) => void;
    activeTradeTab: string;
    setActiveTradeTab: (val: string) => void;

    outsideControl: boolean;
    setOutsideControl: (val: boolean) => void;
    handlePulseAnimation: (type: 'swap' | 'limitOrder' | 'range') => void;

    activeMobileComponent: string;
    setActiveMobileComponent: (val: string) => void;

    hideEmptyPositionsOnAccount: boolean;
    setHideEmptyPositionsOnAccount: (val: boolean) => void;
}

export interface TradeTokenContextIF {
    baseToken: {
        address: string;
        balance: string;
        setBalance: (val: string) => void;
        dexBalance: string;
        setDexBalance: (val: string) => void;
        decimals: number;
    };
    quoteToken: {
        address: string;
        balance: string;
        setBalance: (val: string) => void;
        dexBalance: string;
        setDexBalance: (val: string) => void;
        decimals: number;
    };
    tokenABalance: string;
    tokenBBalance: string;
    tokenADexBalance: string;
    tokenBDexBalance: string;
    isTokenAEth: boolean;
    isTokenBEth: boolean;
    tokenAAllowance: bigint | undefined;
    tokenBAllowance: bigint | undefined;
    setRecheckTokenAApproval: (val: boolean) => void;
    setRecheckTokenBApproval: (val: boolean) => void;
    isTokenABase: boolean;
    contextMatchesParams: boolean;
}

export interface UserDataContextIF {
    isUserConnected: boolean | undefined;
    userAddress: `0x${string}` | undefined;
    walletChain: number | undefined;
    disconnectUser: () => void;
    ensName: string | null | undefined;
    resolvedAddressFromContext: string;
    setResolvedAddressInContext: Dispatch<SetStateAction<string>>;
    userProfileNFT: string | undefined;
    setUserProfileNFT: Dispatch<SetStateAction<string | undefined>>;
    userThumbnailNFT: string | undefined;
    setUserThumbnailNFT: Dispatch<SetStateAction<string | undefined>>;
    currentUserID: string | undefined;
    setCurrentUserID: Dispatch<SetStateAction<string | undefined>>;
    isfetchNftTriggered: boolean;
    setIsfetchNftTriggered: Dispatch<SetStateAction<boolean>>;
    secondaryEnsFromContext: string;
    setSecondaryEnsInContext: Dispatch<SetStateAction<string>>;
    nftTestWalletAddress: string;
    setNftTestWalletAddress: Dispatch<SetStateAction<string>>;
    userAvatarData: UserAvatarDataIF | undefined;
    updateUserAvatarData: (
        walletID: string,
        avatarData: UserAvatarDataIF,
    ) => void;
    userVaultData: UserVaultsServerIF[] | undefined;
    setUserVaultData: React.Dispatch<
        React.SetStateAction<UserVaultsServerIF[] | undefined>
    >;
}

export interface UserXpDataIF {
    dataReceived: boolean;
    data: UserXpIF | undefined;
}
export interface UserNftIF {
    userID: string;
    avatarImage: string | undefined;
}

export interface BlastUserXpDataIF {
    dataReceived: boolean;
    data: BlastUserXpIF | undefined;
}

export interface UserPreferenceContextIF {
    favePools: favePoolsMethodsIF;
    swapSlippage: SlippageMethodsIF;
    mintSlippage: SlippageMethodsIF;
    repoSlippage: SlippageMethodsIF;
    dexBalSwap: dexBalanceMethodsIF;
    dexBalLimit: dexBalanceMethodsIF;
    dexBalRange: dexBalanceMethodsIF;
    bypassConfirmSwap: skipConfirmIF;
    bypassConfirmLimit: skipConfirmIF;
    bypassConfirmRange: skipConfirmIF;
    bypassConfirmRepo: skipConfirmIF;
    cssDebug: {
        cache: (k: string, v: string) => void;
        check: (k: string) => string | undefined;
    };
}

export interface XpLeadersDataIF {
    global: XpLeaderboardDataIF;
    byWeek: XpLeaderboardDataIF;
    byChain: XpLeaderboardDataIF;
    getXpLeaders: (xpLeaderboardType: string) => void;
}

export interface XpLeaderboardDataIF {
    dataReceived: boolean;
    data: Array<UserXpIF> | undefined;
}

export interface ColorObjIF {
    selectedColor: string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    replaceSelector: string;
    index: number | undefined;
    placement: string;
}

export type colorFormats = 'text' | 'background' | 'border';

export interface cssColorIF {
    name: string;
    format: colorFormats;
}

export interface allColorsIF {
    text: cssColorIF[];
    background: cssColorIF[];
    border: cssColorIF[];
}

export interface LiquidityDataLocal {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeLiq: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    liqPrices: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deltaAverageUSD: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cumAverageUSD: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    upperBound: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lowerBound: any;
}

export interface LiqSnap {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeLiq: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pinnedMaxPriceDisplayTruncated: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pinnedMinPriceDisplayTruncated: any;
}

export interface sortDetailsIF {
    sortBy: auctionSorts;
    isReversed: boolean;
}

// interface for return value of the hook
export interface sortedAuctionsIF {
    data: AuctionDataIF[];
    active: auctionSorts;
    isReversed: boolean;
    update: (newSort: auctionSorts) => void;
    reverse: () => void;
    custom(s: auctionSorts, r: boolean): void;
}
