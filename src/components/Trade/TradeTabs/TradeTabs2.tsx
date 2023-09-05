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
import Orders from './Orders/Orders';
import moment from 'moment';
import leaderboard from '../../../assets/images/leaderboard.svg';
import openOrdersImage from '../../../assets/images/sidebarImages/openOrders.svg';
import rangePositionsImage from '../../../assets/images/sidebarImages/rangePositions.svg';
import recentTransactionsImage from '../../../assets/images/sidebarImages/recentTx.svg';
import Ranges from './Ranges/Ranges';
import TabComponent from '../../Global/TabComponent/TabComponent';
import PositionsOnlyToggle from './PositionsOnlyToggle/PositionsOnlyToggle';
import { setChangesByUser } from '../../../utils/state/graphDataSlice';
import { fetchUserRecentChanges } from '../../../App/functions/fetchUserRecentChanges';
import Leaderboard from './Ranges/Leaderboard';
import { DefaultTooltip } from '../../Global/StyledTooltip/StyledTooltip';
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
import { CachedDataContext } from '../../../contexts/CachedDataContext';
import { CandleData } from '../../../App/functions/fetchCandleSeries';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { FlexContainer } from '../../../styled/Common';
import { ClearButton } from '../../../styled/Components/TransactionTable';
import TableInfo from '../TableInfo/TableInfo';

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
    } = props;

    const {
        server: { isEnabled: isServerEnabled },
    } = useContext(AppStateContext);
    const { chartSettings, tradeTableState } = useContext(ChartContext);

    const candleTime = chartSettings.candleTime.global;

    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);
    const { isCandleSelected } = useContext(CandleContext);

    const {
        crocEnv,
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const { lastBlockNumber } = useContext(ChainDataContext);

    const { tokens } = useContext(TokenContext);

    const {
        showAllData,
        setShowAllData,
        setCurrentPositionActive,
        setCurrentTxActiveInTransactions,
        outsideControl,
        selectedOutsideTab,
    } = useContext(TradeTableContext);

    const graphData = useAppSelector((state) => state?.graphData);
    const tradeData = useAppSelector((state) => state?.tradeData);
    const { isLoggedIn: isUserConnected, addressCurrent: userAddress } =
        useAppSelector((state) => state.userData);

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
        filter,
        changeState,
        setSelectedDate,
        isAccountView: false,
        setSelectedInsideTab,
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
        setHasUserSelectedViewAll,
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
              {
                  label: 'Info',
                  content: <TableInfo />,
                  icon: leaderboard,
                  showRightSideOption: false,
                  //   onClick: handleChartHeightOnInfo,
              },
          ];

    // -------------------------------END OF DATA-----------------------------------------
    const tabComponentRef = useRef<HTMLDivElement>(null);

    const clickOutsideHandler = () => {
        setCurrentTxActiveInTransactions('');
        setCurrentPositionActive('');
    };

    const clearButtonOrNull = isCandleSelected ? (
        <ClearButton onClick={() => unselectCandle()}>Clear</ClearButton>
    ) : null;

    const utcDiff = moment().utcOffset();
    const utcDiffHours = Math.floor(utcDiff / 60);

    const selectedMessageContent = (
        <FlexContainer
            fullWidth
            alignItems='center'
            justifyContent='center'
            gap={4}
            padding='4px 0'
            background='dark1'
            color='text2'
            fontSize='body'
        >
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
        </FlexContainer>
    );

    useOnClickOutside(tabComponentRef, clickOutsideHandler);

    return (
        <FlexContainer
            ref={tabComponentRef}
            fullWidth
            fullHeight
            padding='8px'
            style={{ position: 'relative' }}
        >
            <FlexContainer
                flexDirection='column'
                fullHeight
                fullWidth
                overflow={tradeTableState !== 'Expanded' ? 'hidden' : 'visible'}
                style={{
                    borderRadius:
                        tradeTableState !== 'Expanded'
                            ? 'var(--border-radius)'
                            : '',
                }}
            >
                {isCandleSelected ? selectedMessageContent : null}
                <TabComponent
                    data={tradeTabData}
                    rightTabOptions={
                        <PositionsOnlyToggle {...positionsOnlyToggleProps} />
                    }
                    setSelectedInsideTab={setSelectedInsideTab}
                    setShowPositionsOnlyToggle={setShowPositionsOnlyToggle}
                />
            </FlexContainer>
        </FlexContainer>
    );
}

export default memo(TradeTabs2);
