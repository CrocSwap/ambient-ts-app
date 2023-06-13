import {
    useState,
    useEffect,
    Dispatch,
    SetStateAction,
    useRef,
    useContext,
    memo,
} from 'react';

import {
    useAppDispatch,
    useAppSelector,
} from '../../../utils/hooks/reduxToolkit';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import Transactions from './Transactions/Transactions';
import styles from './TradeTabs2.module.css';
import Orders from './Orders/Orders';
import moment from 'moment';
import { TransactionIF } from '../../../utils/interfaces/exports';
import leaderboard from '../../../assets/images/leaderboard.svg';
import openOrdersImage from '../../../assets/images/sidebarImages/openOrders.svg';
import rangePositionsImage from '../../../assets/images/sidebarImages/rangePositions.svg';
import recentTransactionsImage from '../../../assets/images/sidebarImages/recentTx.svg';
import Ranges from './Ranges/Ranges';
import TabComponent from '../../Global/TabComponent/TabComponent';
import PositionsOnlyToggle from './PositionsOnlyToggle/PositionsOnlyToggle';
import {
    setChangesByUser,
    setDataLoadingStatus,
} from '../../../utils/state/graphDataSlice';
import { fetchPoolRecentChanges } from '../../../App/functions/fetchPoolRecentChanges';
import { fetchUserRecentChanges } from '../../../App/functions/fetchUserRecentChanges';
import Leaderboard from './Ranges/Leaderboard';
import { DefaultTooltip } from '../../Global/StyledTooltip/StyledTooltip';
import TradeChartsTokenInfo from '../../../pages/Trade/TradeCharts/TradeChartsComponents/TradeChartsTokenInfo';
import { IS_LOCAL_ENV } from '../../../constants';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { TradeTableContext } from '../../../contexts/TradeTableContext';
import useDebounce from '../../../App/hooks/useDebounce';
import {
    diffHashSigLimits,
    diffHashSigPostions,
    diffHashSigTxs,
} from '../../../utils/functions/diffHashSig';
import { CandleContext } from '../../../contexts/CandleContext';
import { TokenContext } from '../../../contexts/TokenContext';
import { ChartContext } from '../../../contexts/ChartContext';
import { useLocation } from 'react-router-dom';
import { CachedDataContext } from '../../../contexts/CachedDataContext';
import { CandleData } from '../../../App/functions/fetchCandleSeries';

interface propsIF {
    filter: CandleData | undefined;
    setTransactionFilter: Dispatch<SetStateAction<CandleData | undefined>>;
    changeState: (
        isOpen: boolean | undefined,
        candleData: CandleData | undefined,
    ) => void;
    selectedDate: number | undefined;
    setSelectedDate: Dispatch<number | undefined>;
    hasInitialized: boolean;
    setHasInitialized: Dispatch<SetStateAction<boolean>>;
    unselectCandle: () => void;
    isCandleArrived: boolean;
    setIsCandleDataArrived: Dispatch<SetStateAction<boolean>>;
    showActiveMobileComponent?: boolean;
}

function TradeTabs2(props: propsIF) {
    const {
        filter,
        setTransactionFilter,
        changeState,
        selectedDate,
        setSelectedDate,
        hasInitialized,
        setHasInitialized,
        unselectCandle,
        isCandleArrived,
        setIsCandleDataArrived,
        showActiveMobileComponent,
    } = props;

    const { pathname } = useLocation();
    const { chartSettings } = useContext(ChartContext);
    const isMarketOrLimitModule =
        pathname.includes('market') || pathname.includes('limit');
    const candleTime = isMarketOrLimitModule
        ? chartSettings.candleTime.market
        : chartSettings.candleTime.range;

    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);
    const { isCandleSelected } = useContext(CandleContext);

    const {
        crocEnv,
        chainData: { chainId, poolIndex },
    } = useContext(CrocEnvContext);

    const { lastBlockNumber } = useContext(ChainDataContext);

    const { tokens } = useContext(TokenContext);

    const {
        showAllData,
        setShowAllData,
        setCurrentPositionActive,
        setCurrentTxActiveInTransactions,
        expandTradeTable,
        outsideControl,
        setOutsideControl,
        selectedOutsideTab,
    } = useContext(TradeTableContext);

    const graphData = useAppSelector((state) => state?.graphData);
    const tradeData = useAppSelector((state) => state?.tradeData);
    const { isLoggedIn: isUserConnected, addressCurrent: userAddress } =
        useAppSelector((state) => state.userData);

    // allow a local environment variable to be defined in [app_repo]/.env.local to turn off connections to the cache server
    const isServerEnabled =
        process.env.REACT_APP_CACHE_SERVER_IS_ENABLED !== undefined
            ? process.env.REACT_APP_CACHE_SERVER_IS_ENABLED === 'true'
            : true;

    const userChanges = graphData?.changesByUser?.changes;
    const userLimitOrders = graphData?.limitOrdersByUser?.limitOrders;
    const userPositions = graphData?.positionsByUser?.positions;

    const userPositionsDataReceived = graphData?.positionsByUser.dataReceived;

    const [selectedInsideTab, setSelectedInsideTab] = useState<number>(0);

    const [hasUserSelectedViewAll, setHasUserSelectedViewAll] =
        useState<boolean>(false);

    const selectedBase = tradeData.baseToken.address;
    const selectedQuote = tradeData.quoteToken.address;

    const userChangesMatchingTokenSelection = userChanges.filter(
        (userChange) => {
            return (
                userChange.base.toLowerCase() === selectedBase.toLowerCase() &&
                userChange.quote.toLowerCase() === selectedQuote.toLowerCase()
            );
        },
    );

    const userLimitOrdersMatchingTokenSelection = userLimitOrders.filter(
        (userLimitOrder) => {
            return (
                userLimitOrder.base.toLowerCase() ===
                    selectedBase.toLowerCase() &&
                userLimitOrder.quote.toLowerCase() ===
                    selectedQuote.toLowerCase()
            );
        },
    );

    const userPositionsMatchingTokenSelection = userPositions.filter(
        (userPosition) => {
            return (
                userPosition.base.toLowerCase() ===
                    selectedBase.toLowerCase() &&
                userPosition.quote.toLowerCase() ===
                    selectedQuote.toLowerCase() &&
                userPosition.positionLiq !== 0
            );
        },
    );

    useEffect(() => {
        setHasInitialized(false);
        setHasUserSelectedViewAll(false);
    }, [userAddress, isUserConnected, selectedBase, selectedQuote]);

    // Wait 2 seconds before refreshing to give cache server time to sync from
    // last block
    const lastBlockNumWait = useDebounce(lastBlockNumber, 2000);

    useEffect(() => {
        if (
            !hasInitialized &&
            !hasUserSelectedViewAll &&
            userPositionsDataReceived
        ) {
            if (
                (outsideControl && selectedOutsideTab === 0) ||
                (!outsideControl && selectedInsideTab === 0)
            ) {
                if (isCandleSelected) {
                    setShowAllData(false);
                } else if (
                    (!isUserConnected && !isCandleSelected) ||
                    (!isCandleSelected &&
                        !showAllData &&
                        userChangesMatchingTokenSelection.length < 1)
                ) {
                    setShowAllData(true);
                } else if (userChangesMatchingTokenSelection.length < 1) {
                    return;
                } else if (
                    showAllData &&
                    userChangesMatchingTokenSelection.length >= 1
                ) {
                    setShowAllData(false);
                }
            } else if (
                (outsideControl && selectedOutsideTab === 1) ||
                (!outsideControl && selectedInsideTab === 1)
            ) {
                if (
                    !isUserConnected ||
                    (!isCandleSelected &&
                        !showAllData &&
                        userLimitOrdersMatchingTokenSelection.length < 1)
                ) {
                    setShowAllData(true);
                } else if (userLimitOrdersMatchingTokenSelection.length < 1) {
                    return;
                } else if (
                    showAllData &&
                    userLimitOrdersMatchingTokenSelection.length >= 1
                ) {
                    setShowAllData(false);
                }
            } else if (
                (outsideControl && selectedOutsideTab === 2) ||
                (!outsideControl && selectedInsideTab === 2)
            ) {
                if (
                    !isUserConnected ||
                    (!isCandleSelected &&
                        !showAllData &&
                        userPositionsMatchingTokenSelection.length < 1)
                ) {
                    setShowAllData(true);
                } else if (userPositionsMatchingTokenSelection.length < 1) {
                    return;
                } else if (
                    showAllData &&
                    userPositionsMatchingTokenSelection.length >= 1
                ) {
                    setShowAllData(false);
                }
            }
            setHasInitialized(true);
        }
    }, [
        userPositionsDataReceived,
        hasUserSelectedViewAll,
        isUserConnected,
        hasInitialized,
        isCandleSelected,
        outsideControl,
        selectedInsideTab,
        selectedOutsideTab,
        showAllData,
        diffHashSigTxs(userChangesMatchingTokenSelection),
        diffHashSigLimits(userLimitOrders),
        diffHashSigPostions(userPositionsMatchingTokenSelection),
    ]);

    const dispatch = useAppDispatch();

    const [changesInSelectedCandle, setChangesInSelectedCandle] = useState<
        TransactionIF[]
    >([]);

    useEffect(() => {
        if (isServerEnabled && isCandleSelected && filter?.time && crocEnv) {
            fetchPoolRecentChanges({
                tokenList: tokens.tokenUniv,
                base: selectedBase,
                quote: selectedQuote,
                poolIdx: poolIndex,
                chainId: chainId,
                annotate: true,
                addValue: true,
                simpleCalc: true,
                annotateMEV: false,
                ensResolution: true,
                n: 80,
                period: candleTime.time,
                time: filter?.time,
                crocEnv: crocEnv,
                lastBlockNumber,
                cachedFetchTokenPrice: cachedFetchTokenPrice,
                cachedQuerySpotPrice: cachedQuerySpotPrice,
                cachedTokenDetails: cachedTokenDetails,
                cachedEnsResolve: cachedEnsResolve,
            })
                .then((selectedCandleChangesJson) => {
                    IS_LOCAL_ENV &&
                        console.debug({ selectedCandleChangesJson });
                    if (selectedCandleChangesJson) {
                        const selectedCandleChangesWithoutFills =
                            selectedCandleChangesJson.filter((tx) => {
                                if (tx.changeType !== 'fill') {
                                    return true;
                                } else {
                                    return false;
                                }
                            });
                        setChangesInSelectedCandle(
                            selectedCandleChangesWithoutFills,
                        );
                    }
                    setOutsideControl(true);
                    setSelectedInsideTab(0);
                    dispatch(
                        setDataLoadingStatus({
                            datasetName: 'candleData',
                            loadingStatus: false,
                        }),
                    );
                })
                .catch(console.error);
        }
    }, [isServerEnabled, isCandleSelected, filter?.time, lastBlockNumWait]);

    useEffect(() => {
        if (userAddress && isServerEnabled && !showAllData && crocEnv) {
            try {
                fetchUserRecentChanges({
                    tokenList: tokens.tokenUniv,
                    user: userAddress,
                    chainId: chainId,
                    annotate: true,
                    addValue: true,
                    simpleCalc: true,
                    annotateMEV: false,
                    ensResolution: true,
                    n: 100, // fetch last 100 changes,
                    crocEnv,
                    lastBlockNumber,
                    cachedFetchTokenPrice: cachedFetchTokenPrice,
                    cachedQuerySpotPrice: cachedQuerySpotPrice,
                    cachedTokenDetails: cachedTokenDetails,
                    cachedEnsResolve: cachedEnsResolve,
                })
                    .then((updatedTransactions) => {
                        if (updatedTransactions) {
                            dispatch(
                                setChangesByUser({
                                    dataReceived: true,
                                    changes: updatedTransactions,
                                }),
                            );
                        }
                    })
                    .catch(console.error);
            } catch (error) {
                console.error;
            }
        }
    }, [isServerEnabled, userAddress, showAllData, lastBlockNumWait]);

    // -------------------------------DATA-----------------------------------------
    // Props for <Ranges/> React Element
    const rangesProps = {
        notOnTradeRoute: false,
        isAccountView: false,
    };

    // Props for <Transactions/> React Element
    const transactionsProps = {
        changesInSelectedCandle,
        filter,
        changeState,
        setSelectedDate,
        isAccountView: false,
    };

    // Props for <Orders/> React Element
    const ordersProps = {
        changeState,
        isAccountView: false,
    };

    const [showPositionsOnlyToggle, setShowPositionsOnlyToggle] =
        useState(true);

    const positionsOnlyToggleProps = {
        setTransactionFilter,
        showPositionsOnlyToggle,
        changeState,
        setSelectedDate,
        isCandleArrived,
        setIsCandleDataArrived,
        setHasUserSelectedViewAll,
    };

    const TradeChartsTokenInfoProps = {
        simplifyVersion: true,
    };

    // data for headings of each of the three tabs
    const tradeTabData = isCandleSelected
        ? [
              {
                  label: 'Transactions',
                  content: <Transactions {...transactionsProps} />,
                  icon: recentTransactionsImage,
                  showRightSideOption: true,
              },
          ]
        : [
              {
                  label: 'Transactions',
                  content: <Transactions {...transactionsProps} />,
                  icon: recentTransactionsImage,
                  showRightSideOption: true,
              },
              {
                  label: 'Limits',
                  content: <Orders {...ordersProps} />,
                  icon: openOrdersImage,
                  showRightSideOption: true,
              },
              {
                  label: 'Ranges',
                  content: <Ranges {...rangesProps} />,
                  icon: rangePositionsImage,
                  showRightSideOption: true,
              },
              {
                  label: 'Leaderboard',
                  content: <Leaderboard />,
                  icon: leaderboard,
                  showRightSideOption: false,
              },
          ];

    // -------------------------------END OF DATA-----------------------------------------
    const tabComponentRef = useRef<HTMLDivElement>(null);

    const clickOutsideHandler = () => {
        setCurrentTxActiveInTransactions('');
        setCurrentPositionActive('');
    };

    const clearButtonOrNull = isCandleSelected ? (
        <button
            className={styles.option_button}
            onClick={() => unselectCandle()}
        >
            Clear
        </button>
    ) : null;

    const utcDiff = moment().utcOffset();
    const utcDiffHours = Math.floor(utcDiff / 60);

    const selectedMessageContent = (
        <div className={styles.show_tx_message}>
            <DefaultTooltip
                interactive
                title={
                    candleTime.time === 86400
                        ? 'Transactions for 24 hours since Midnight UTC'
                        : `Transactions for ${candleTime.readableTime} timeframe`
                }
                placement={'bottom'}
                arrow
                enterDelay={300}
                leaveDelay={200}
            >
                <p
                    onClick={() => unselectCandle()}
                    style={
                        isCandleSelected
                            ? { cursor: 'pointer' }
                            : { cursor: 'default' }
                    }
                >
                    {isCandleSelected &&
                        candleTime.time === 86400 &&
                        selectedDate &&
                        `Showing Transactions ${moment(new Date(selectedDate))
                            .subtract(utcDiffHours, 'hours')
                            .calendar(null, {
                                sameDay: 'for [Today]',
                                // sameDay: '[Today]',
                                nextDay: 'for ' + '[Tomorrow]',
                                nextWeek: 'for' + 'dddd',
                                lastDay: 'for ' + '[Yesterday]',
                                lastWeek: 'for ' + '[Last] dddd',
                                sameElse: 'for ' + 'MM/DD/YYYY',
                            })}`}
                    {isCandleSelected &&
                        candleTime.time !== 86400 &&
                        `Showing Transactions for ${moment(
                            selectedDate,
                        ).calendar()}`}
                </p>
            </DefaultTooltip>

            {clearButtonOrNull}
        </div>
    );

    useOnClickOutside(tabComponentRef, clickOutsideHandler);

    return (
        <div ref={tabComponentRef} className={styles.trade_tab_container}>
            {isCandleSelected ? selectedMessageContent : null}
            {(expandTradeTable || showActiveMobileComponent) && (
                <TradeChartsTokenInfo {...TradeChartsTokenInfoProps} />
            )}
            <TabComponent
                data={tradeTabData}
                rightTabOptions={
                    <PositionsOnlyToggle {...positionsOnlyToggleProps} />
                }
                setSelectedInsideTab={setSelectedInsideTab}
                setShowPositionsOnlyToggle={setShowPositionsOnlyToggle}
            />
        </div>
    );
}

export default memo(TradeTabs2);
