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
    CandleData,
    setChangesByUser,
} from '../../../utils/state/graphDataSlice';
import { fetchPoolRecentChanges } from '../../../App/functions/fetchPoolRecentChanges';
import { fetchUserRecentChanges } from '../../../App/functions/fetchUserRecentChanges';
import Leaderboard from './Ranges/Leaderboard';
import { DefaultTooltip } from '../../Global/StyledTooltip/StyledTooltip';
import TradeChartsTokenInfo from '../../../pages/Trade/TradeCharts/TradeChartsComponents/TradeChartsTokenInfo';
import { candleTimeIF } from '../../../App/hooks/useChartSettings';
import { IS_LOCAL_ENV } from '../../../constants';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { TradeTableContext } from '../../../contexts/TradeTableContext';
import { tokenMethodsIF } from '../../../App/hooks/useTokens';

interface propsIF {
    isCandleSelected: boolean | undefined;
    filter: CandleData | undefined;
    setIsCandleSelected: Dispatch<SetStateAction<boolean | undefined>>;
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
    isCandleDataNull: boolean;
    isCandleArrived: boolean;
    setIsCandleDataArrived: Dispatch<SetStateAction<boolean>>;
    candleTime: candleTimeIF;
    tokens: tokenMethodsIF;
    showActiveMobileComponent?: boolean;
}

function TradeTabs2(props: propsIF) {
    const {
        isCandleSelected,
        setIsCandleSelected,
        filter,
        setTransactionFilter,
        changeState,
        selectedDate,
        setSelectedDate,
        hasInitialized,
        setHasInitialized,
        unselectCandle,
        isCandleDataNull,
        isCandleArrived,
        setIsCandleDataArrived,
        candleTime,
        tokens,
        showActiveMobileComponent,
    } = props;

    const {
        chainData: { chainId, poolIndex },
    } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
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
                userPosition.totalValueUSD !== 0
            );
        },
    );

    const matchingUserChangesLength = userChangesMatchingTokenSelection.length;
    const matchingUserLimitOrdersLength =
        userLimitOrdersMatchingTokenSelection.length;
    const matchingUserPositionsLength =
        userPositionsMatchingTokenSelection.length;

    useEffect(() => {
        setHasInitialized(false);
        setHasUserSelectedViewAll(false);
    }, [userAddress, isUserConnected, selectedBase, selectedQuote]);

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
                        matchingUserChangesLength < 1)
                ) {
                    setShowAllData(true);
                } else if (matchingUserChangesLength < 1) {
                    return;
                } else if (showAllData && matchingUserChangesLength >= 1) {
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
                        matchingUserLimitOrdersLength < 1)
                ) {
                    setShowAllData(true);
                } else if (matchingUserLimitOrdersLength < 1) {
                    return;
                } else if (showAllData && matchingUserLimitOrdersLength >= 1) {
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
                        matchingUserPositionsLength < 1)
                ) {
                    setShowAllData(true);
                } else if (matchingUserPositionsLength < 1) {
                    return;
                } else if (showAllData && matchingUserPositionsLength >= 1) {
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
        matchingUserPositionsLength,
        matchingUserChangesLength,
        matchingUserLimitOrdersLength,
    ]);

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (userAddress && isServerEnabled && !showAllData) {
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
                    n: 200, // fetch last 500 changes,
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
    }, [isServerEnabled, userAddress, showAllData]);

    const [changesInSelectedCandle, setChangesInSelectedCandle] = useState<
        TransactionIF[]
    >([]);

    useEffect(() => {
        if (isServerEnabled && isCandleSelected && filter?.time) {
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
                })
                .catch(console.error);
        }
    }, [isServerEnabled, isCandleSelected, filter?.time, lastBlockNumber]);

    // -------------------------------DATA-----------------------------------------
    const [leader, setLeader] = useState('');
    const [leaderOwnerId, setLeaderOwnerId] = useState('');

    // Props for <Ranges/> React Element
    const rangesProps = {
        notOnTradeRoute: false,
        setLeader: setLeader,
        setLeaderOwnerId: setLeaderOwnerId,
        isAccountView: false,
    };

    // Props for <Transactions/> React Element
    const transactionsProps = {
        changesInSelectedCandle: changesInSelectedCandle,
        setIsCandleSelected: setIsCandleSelected,
        isCandleSelected: isCandleSelected,
        filter: filter,
        changeState: changeState,
        setSelectedDate: setSelectedDate,
        isAccountView: false,
    };

    // Props for <Orders/> React Element
    const ordersProps = {
        setShowAllData: setShowAllData,
        setIsCandleSelected: setIsCandleSelected,
        changeState: changeState,
        isAccountView: false,
    };

    const [showPositionsOnlyToggle, setShowPositionsOnlyToggle] =
        useState(true);

    const positionsOnlyToggleProps = {
        setHasUserSelectedViewAll: setHasUserSelectedViewAll,
        changeState: changeState,
        setHasInitialized: setHasInitialized,
        setIsCandleSelected: setIsCandleSelected,
        isCandleSelected: isCandleSelected,
        setTransactionFilter: setTransactionFilter,
        showPositionsOnlyToggle: showPositionsOnlyToggle,
        setShowPositionsOnlyToggle: setShowPositionsOnlyToggle,
        leader: leader,
        leaderOwnerId: leaderOwnerId,
        selectedDate: selectedDate,
        setSelectedDate: setSelectedDate,
        isCandleDataNull: isCandleDataNull,
        isCandleArrived: isCandleArrived,
        setIsCandleDataArrived: setIsCandleDataArrived,
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
                showPositionsOnlyToggle={showPositionsOnlyToggle}
                setShowPositionsOnlyToggle={setShowPositionsOnlyToggle}
            />
        </div>
    );
}

export default memo(TradeTabs2);
