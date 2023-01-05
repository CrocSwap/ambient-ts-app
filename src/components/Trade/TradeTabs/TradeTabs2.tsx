import { useState, useEffect, Dispatch, SetStateAction, useRef } from 'react';

import { useAppDispatch, useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { ethers } from 'ethers';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import Transactions from './Transactions/Transactions';
import styles from './TradeTabs2.module.css';
import Orders from './Orders/Orders';
import moment from 'moment';
import { PoolIF, TokenIF } from '../../../utils/interfaces/exports';

// import DropdownMenu from '../../Global/DropdownMenu/DropdownMenu';
// import DropdownMenuContainer from '../../Global/DropdownMenu/DropdownMenuContainer/DropdownMenuContainer';
// import DropdownMenuItem from '../../Global/DropdownMenu/DropdownMenuItem/DropdownMenuItem';
// import { BiDownArrow } from 'react-icons/bi';

import openOrdersImage from '../../../assets/images/sidebarImages/openOrders.svg';
import rangePositionsImage from '../../../assets/images/sidebarImages/rangePositions.svg';
import recentTransactionsImage from '../../../assets/images/sidebarImages/recentTransactions.svg';
import Ranges from './Ranges/Ranges';
import TabComponent from '../../Global/TabComponent/TabComponent';
import PositionsOnlyToggle from './PositionsOnlyToggle/PositionsOnlyToggle';
import { CandleData, ITransaction, setChangesByUser } from '../../../utils/state/graphDataSlice';
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import { fetchPoolRecentChanges } from '../../../App/functions/fetchPoolRecentChanges';

import { fetchUserRecentChanges } from '../../../App/functions/fetchUserRecentChanges';
import Leaderboard from './Ranges/Leaderboard';
import PoolInfo from './PoolInfo/PoolInfo';
import { DefaultTooltip } from '../../Global/StyledTooltip/StyledTooltip';
import TradeChartsTokenInfo from '../../../pages/Trade/TradeCharts/TradeChartsComponents/TradeChartsTokenInfo';

interface ITabsProps {
    isUserLoggedIn: boolean | undefined;
    isTokenABase: boolean;
    crocEnv: CrocEnv | undefined;
    provider: ethers.providers.Provider | undefined;
    account: string;

    lastBlockNumber: number;
    chainId: string;
    chainData: ChainSpec;
    currentTxActiveInTransactions: string;
    setCurrentTxActiveInTransactions: Dispatch<SetStateAction<string>>;
    isShowAllEnabled: boolean;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    tokenMap: Map<string, TokenIF>;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
    isCandleSelected: boolean | undefined;
    filter: CandleData | undefined;
    setIsCandleSelected: Dispatch<SetStateAction<boolean | undefined>>;
    setTransactionFilter: Dispatch<SetStateAction<CandleData | undefined>>;
    selectedOutsideTab: number;
    setSelectedOutsideTab: Dispatch<SetStateAction<number>>;
    outsideControl: boolean;
    setOutsideControl: Dispatch<SetStateAction<boolean>>;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;

    openGlobalModal: (content: React.ReactNode) => void;

    closeGlobalModal: () => void;
    importedTokens: TokenIF[];
    showSidebar: boolean;
    handlePulseAnimation: (type: string) => void;
    changeState: (isOpen: boolean | undefined, candleData: CandleData | undefined) => void;
    selectedDate: Date | undefined;
    setSelectedDate: React.Dispatch<Date | undefined>;
    hasInitialized: boolean;
    setHasInitialized: Dispatch<SetStateAction<boolean>>;
    // handleTxCopiedClick: () => void;
    // handleOrderCopiedClick: () => void;
    // handleRangeCopiedClick: () => void;
    activeTimeFrame: string;
    unselectCandle: () => void;

    favePools: PoolIF[];
    addPoolToFaves: (tokenA: TokenIF, tokenB: TokenIF, chainId: string, poolId: number) => void;
    removePoolFromFaves: (
        tokenA: TokenIF,
        tokenB: TokenIF,
        chainId: string,
        poolId: number,
    ) => void;
    poolPriceDisplay: number;

    poolPriceChangePercent: string | undefined;

    setPoolPriceChangePercent: Dispatch<SetStateAction<string | undefined>>;
    isPoolPriceChangePositive: boolean;

    setIsPoolPriceChangePositive: Dispatch<SetStateAction<boolean>>;
}

// const httpGraphCacheServerDomain = 'https://809821320828123.de:5000';

export default function TradeTabs2(props: ITabsProps) {
    const {
        isUserLoggedIn,
        isTokenABase,
        crocEnv,
        chainId,
        chainData,
        account,
        isShowAllEnabled,
        setIsShowAllEnabled,
        tokenMap,
        baseTokenBalance,
        quoteTokenBalance,
        baseTokenDexBalance,
        quoteTokenDexBalance,
        provider,
        isCandleSelected,
        setIsCandleSelected,
        filter,
        setTransactionFilter,
        lastBlockNumber,
        expandTradeTable,
        setExpandTradeTable,
        currentPositionActive,
        setCurrentPositionActive,
        currentTxActiveInTransactions,
        setCurrentTxActiveInTransactions,
        selectedOutsideTab,
        setSelectedOutsideTab,
        outsideControl,
        setOutsideControl,
        importedTokens,
        showSidebar,
        handlePulseAnimation,
        changeState,
        selectedDate,
        setSelectedDate,
        hasInitialized,
        setHasInitialized,
        activeTimeFrame,
        unselectCandle,
        // handleTxCopiedClick,
        // handleOrderCopiedClick,
        // handleRangeCopiedClick,

        favePools,
        addPoolToFaves,
        removePoolFromFaves,
        poolPriceDisplay,

        poolPriceChangePercent,
        setPoolPriceChangePercent,
        isPoolPriceChangePositive,
        // setIsPoolPriceChangePositive
    } = props;

    const graphData = useAppSelector((state) => state?.graphData);
    const tradeData = useAppSelector((state) => state?.tradeData);

    // allow a local environment variable to be defined in [app_repo]/.env.local to turn off connections to the cache server
    const isServerEnabled =
        process.env.REACT_APP_CACHE_SERVER_IS_ENABLED !== undefined
            ? process.env.REACT_APP_CACHE_SERVER_IS_ENABLED === 'true'
            : true;

    const activeChartPeriod = tradeData.activeChartPeriod;
    // const userData = useAppSelector((state) => state?.userData);

    const userChanges = graphData?.changesByUser?.changes;
    const userLimitOrders = graphData?.limitOrdersByUser?.limitOrders;
    const userPositions = graphData?.positionsByUser?.positions;
    // const poolPositions = graphData?.positionsByPool?.positions;

    const [selectedInsideTab, setSelectedInsideTab] = useState<number>(0);

    const selectedBase = tradeData.baseToken.address;
    const selectedQuote = tradeData.quoteToken.address;

    const userChangesMatchingTokenSelection = userChanges.filter((userChange) => {
        return (
            userChange.base.toLowerCase() === selectedBase.toLowerCase() &&
            userChange.quote.toLowerCase() === selectedQuote.toLowerCase()
        );
    });

    const userLimitOrdersMatchingTokenSelection = userLimitOrders.filter((userLimitOrder) => {
        return (
            userLimitOrder.base.toLowerCase() === selectedBase.toLowerCase() &&
            userLimitOrder.quote.toLowerCase() === selectedQuote.toLowerCase()
        );
    });

    const userPositionsMatchingTokenSelection = userPositions.filter((userPosition) => {
        return (
            userPosition.base.toLowerCase() === selectedBase.toLowerCase() &&
            userPosition.quote.toLowerCase() === selectedQuote.toLowerCase()
        );
    });

    const matchingUserChangesLength = userChangesMatchingTokenSelection.length;
    const matchingUserLimitOrdersLength = userLimitOrdersMatchingTokenSelection.length;
    const matchingUserPositionsLength = userPositionsMatchingTokenSelection.length;

    useEffect(() => {
        setHasInitialized(false);
    }, [
        account,
        isUserLoggedIn,
        // userData.isLoggedIn,
        matchingUserChangesLength,
        matchingUserLimitOrdersLength,
        matchingUserPositionsLength,
        // selectedOutsideTab,
        selectedBase,
        selectedQuote,
    ]);

    useEffect(() => {
        if (!hasInitialized) {
            // console.log({ outsideControl });
            // console.log({ selectedOutsideTab });
            // console.log({ selectedInsideTab });
            if (
                (outsideControl && selectedOutsideTab === 0) ||
                (!outsideControl && selectedInsideTab === 0)
            ) {
                if (isCandleSelected) {
                    setIsShowAllEnabled(false);
                } else if (
                    (!isUserLoggedIn && !isCandleSelected) ||
                    (!isCandleSelected && !isShowAllEnabled && matchingUserChangesLength < 1)
                ) {
                    // console.log('1');
                    setIsShowAllEnabled(true);
                } else if (matchingUserChangesLength < 1) {
                    // console.log('2');
                    return;
                } else if (isShowAllEnabled && matchingUserChangesLength >= 1) {
                    // console.log('3');
                    setIsShowAllEnabled(false);
                }
            } else if (
                (outsideControl && selectedOutsideTab === 1) ||
                (!outsideControl && selectedInsideTab === 1)
            ) {
                if (
                    !isUserLoggedIn ||
                    (!isCandleSelected && !isShowAllEnabled && matchingUserLimitOrdersLength < 1)
                ) {
                    // console.log('4');
                    setIsShowAllEnabled(true);
                } else if (matchingUserLimitOrdersLength < 1) {
                    // console.log('5');
                    return;
                } else if (isShowAllEnabled && matchingUserLimitOrdersLength >= 1) {
                    // console.log('6');
                    setIsShowAllEnabled(false);
                }
            } else if (
                (outsideControl && selectedOutsideTab === 2) ||
                (!outsideControl && selectedInsideTab === 2)
            ) {
                if (
                    !isUserLoggedIn ||
                    (!isCandleSelected && !isShowAllEnabled && matchingUserPositionsLength < 1)
                ) {
                    // console.log('7');
                    setIsShowAllEnabled(true);
                } else if (matchingUserPositionsLength < 1) {
                    // console.log('8');
                    return;
                } else if (isShowAllEnabled && matchingUserPositionsLength >= 1) {
                    // console.log('9');
                    setIsShowAllEnabled(false);
                }
            }
            setHasInitialized(true);
        }
    }, [
        isUserLoggedIn,
        hasInitialized,
        isCandleSelected,
        outsideControl,
        selectedInsideTab,
        selectedOutsideTab,
        isShowAllEnabled,
        matchingUserPositionsLength,
        matchingUserChangesLength,
        matchingUserLimitOrdersLength,
    ]);

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (account && isServerEnabled && !isShowAllEnabled) {
            try {
                fetchUserRecentChanges({
                    tokensOnActiveLists: tokenMap,
                    user: account,
                    chainId: chainData.chainId,
                    annotate: true,
                    addValue: true,
                    simpleCalc: true,
                    annotateMEV: false,
                    ensResolution: true,
                    n: 500, // fetch last 500 changes,
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
                    .catch(console.log);
            } catch (error) {
                console.log;
            }
        }
    }, [isServerEnabled, account, isShowAllEnabled]);

    const [changesInSelectedCandle, setChangesInSelectedCandle] = useState<ITransaction[]>([]);

    useEffect(() => {
        // console.log({ filter });
        if (isServerEnabled && isCandleSelected && filter?.time) {
            fetchPoolRecentChanges({
                tokensOnActiveLists: tokenMap,
                base: selectedBase,
                quote: selectedQuote,
                poolIdx: chainData.poolIndex,
                chainId: chainData.chainId,
                annotate: true,
                addValue: true,
                simpleCalc: true,
                annotateMEV: false,
                ensResolution: true,
                n: 100,
                period: activeChartPeriod,
                time: filter?.time,
            })
                .then((selectedCandleChangesJson) => {
                    console.log({ selectedCandleChangesJson });
                    if (selectedCandleChangesJson) {
                        const selectedCandleChangesWithoutFills = selectedCandleChangesJson.filter(
                            (tx) => {
                                if (tx.changeType !== 'fill') {
                                    return true;
                                } else {
                                    return false;
                                }
                            },
                        );
                        setChangesInSelectedCandle(selectedCandleChangesWithoutFills);
                    }
                    setOutsideControl(true);
                    setSelectedInsideTab(0);
                })
                .catch(console.log);
        }
    }, [isServerEnabled, isCandleSelected, filter?.time, lastBlockNumber]);

    // -------------------------------DATA-----------------------------------------
    const [leader, setLeader] = useState('');
    const [leaderOwnerId, setLeaderOwnerId] = useState('');

    // console.log(leader);

    // Props for <Ranges/> React Element
    const rangesProps = {
        isUserLoggedIn: isUserLoggedIn,
        crocEnv: crocEnv,
        chainData: chainData,
        baseTokenBalance: baseTokenBalance,
        quoteTokenBalance: quoteTokenBalance,
        baseTokenDexBalance: baseTokenDexBalance,
        quoteTokenDexBalance: quoteTokenDexBalance,
        importedTokens: importedTokens,
        provider: provider,
        account: account,
        chainId: chainId,
        isShowAllEnabled: isShowAllEnabled,
        notOnTradeRoute: false,
        graphData: graphData,
        lastBlockNumber: lastBlockNumber,
        expandTradeTable: expandTradeTable,
        currentPositionActive: currentPositionActive,
        setCurrentPositionActive: setCurrentPositionActive,
        openGlobalModal: props.openGlobalModal,

        closeGlobalModal: props.closeGlobalModal,
        showSidebar: showSidebar,
        isOnPortfolioPage: false,

        setLeader: setLeader,
        setLeaderOwnerId: setLeaderOwnerId,
        handlePulseAnimation: handlePulseAnimation,
        // handleRangeCopiedClick: handleRangeCopiedClick,
        setIsShowAllEnabled: setIsShowAllEnabled,
    };
    // Props for <Ranges/> React Element
    const poolInfoProps = {
        chainData: chainData,
        lastBlockNumber: lastBlockNumber,
        showSidebar: showSidebar,
    };
    // Props for <Transactions/> React Element
    const transactionsProps = {
        isShowAllEnabled: isShowAllEnabled,
        importedTokens: importedTokens,
        isTokenABase: isTokenABase,
        changesInSelectedCandle: changesInSelectedCandle,
        tokenMap: tokenMap,
        graphData: graphData,
        chainData: chainData,
        blockExplorer: chainData.blockExplorer || undefined,
        currentTxActiveInTransactions: currentTxActiveInTransactions,
        account: account,
        setCurrentTxActiveInTransactions: setCurrentTxActiveInTransactions,
        expandTradeTable: expandTradeTable,
        setIsShowAllEnabled: setIsShowAllEnabled,
        setIsCandleSelected: setIsCandleSelected,
        isCandleSelected: isCandleSelected,
        filter: filter,
        closeGlobalModal: props.closeGlobalModal,
        changeState: changeState,
        openGlobalModal: props.openGlobalModal,
        showSidebar: showSidebar,
        setSelectedDate: setSelectedDate,
        isOnPortfolioPage: false,

        handlePulseAnimation: handlePulseAnimation,
        // handleTxCopiedClick: handleTxCopiedClick,
    };
    // Props for <Orders/> React Element
    const ordersProps = {
        crocEnv: crocEnv,
        importedTokens: importedTokens,
        expandTradeTable: expandTradeTable,
        chainData: chainData,
        isShowAllEnabled: isShowAllEnabled,
        account: account,
        graphData: graphData,
        openGlobalModal: props.openGlobalModal,
        currentPositionActive: currentPositionActive,
        closeGlobalModal: props.closeGlobalModal,
        setCurrentPositionActive: setCurrentPositionActive,
        showSidebar: showSidebar,
        isOnPortfolioPage: false,
        handlePulseAnimation: handlePulseAnimation,
        // handleOrderCopiedClick: handleOrderCopiedClick,
        setIsShowAllEnabled: setIsShowAllEnabled,
        setIsCandleSelected: setIsCandleSelected,
        changeState: changeState,
        lastBlockNumber: lastBlockNumber,
    };
    // props for <PositionsOnlyToggle/> React Element

    const [showPositionsOnlyToggle, setShowPositionsOnlyToggle] = useState(true);

    const positionsOnlyToggleProps = {
        changeState: changeState,
        isShowAllEnabled: isShowAllEnabled,
        isUserLoggedIn: isUserLoggedIn,
        setHasInitialized: setHasInitialized,
        setIsShowAllEnabled: setIsShowAllEnabled,
        setIsCandleSelected: setIsCandleSelected,
        isCandleSelected: isCandleSelected,
        setTransactionFilter: setTransactionFilter,
        expandTradeTable: expandTradeTable,
        setExpandTradeTable: setExpandTradeTable,
        showPositionsOnlyToggle: showPositionsOnlyToggle,
        setShowPositionsOnlyToggle: setShowPositionsOnlyToggle,
        leader: leader,
        leaderOwnerId: leaderOwnerId,
        selectedDate: selectedDate,
        setSelectedDate: setSelectedDate,
    };

    const TradeChartsTokenInfoProps = {
        chainId: chainId,
        favePools: favePools,
        addPoolToFaves: addPoolToFaves,
        removePoolFromFaves: removePoolFromFaves,
        poolPriceDisplay: poolPriceDisplay,
        poolPriceChangePercent: poolPriceChangePercent,
        setPoolPriceChangePercent: setPoolPriceChangePercent,
        isPoolPriceChangePositive: isPoolPriceChangePositive,
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
              //   {
              //       label: 'Limit Orders',
              //       content: <Orders {...ordersProps} />,
              //       icon: openOrdersImage,
              //       showRightSideOption: true,
              //   },
              //   {
              //       label: 'Ranges',
              //       content: <Ranges {...rangesProps} />,
              //       icon: rangePositionsImage,
              //       showRightSideOption: true,
              //   },
              //   {
              //       label: 'Leaderboard',
              //       content: <Leaderboard {...rangesProps} />,
              //       icon: rangePositionsImage,
              //       showRightSideOption: false,
              //   },
              //   {
              //       label: 'Info',
              //       content: <PoolInfo {...poolInfoProps} />,
              //       icon: rangePositionsImage,
              //       showRightSideOption: false,
              //   },
          ]
        : [
              {
                  label: 'Transactions',
                  content: <Transactions {...transactionsProps} />,
                  icon: recentTransactionsImage,
                  showRightSideOption: true,
              },
              {
                  label: 'Limit Orders',
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
                  content: <Leaderboard {...rangesProps} />,
                  icon: rangePositionsImage,
                  showRightSideOption: false,
              },
              {
                  label: 'Info',
                  content: <PoolInfo {...poolInfoProps} />,
                  icon: rangePositionsImage,
                  showRightSideOption: false,
              },
          ];

    // -------------------------------END OF DATA-----------------------------------------
    const tabComponentRef = useRef<HTMLDivElement>(null);

    const clickOutsideHandler = () => {
        setCurrentTxActiveInTransactions('');
        setCurrentPositionActive('');
    };
    // const unselectCandle = () => {
    //     setSelectedDate(undefined);
    //     changeState(false, undefined);
    //     setIsCandleSelected(false);
    // };

    const clearButtonOrNull = isCandleSelected ? (
        <button className={styles.option_button} onClick={() => unselectCandle()}>
            Clear
        </button>
    ) : null;

    const utcDiff = moment().utcOffset();
    const utcDiffHours = Math.floor(utcDiff / 60);

    // console.log({ utcDiffHours });

    const selectedMessageContent = (
        <div className={styles.show_tx_message}>
            <DefaultTooltip
                interactive
                title={
                    activeTimeFrame === '1d'
                        ? 'Transactions for 24 hours since Midnight UTC'
                        : `Transactions for ${activeTimeFrame} timeframe`
                }
                placement={'bottom'}
                arrow
                enterDelay={300}
                leaveDelay={200}
            >
                <p
                    onClick={() => {
                        unselectCandle();
                        // setIsCandleSelected(false);
                        // setTransactionFilter(undefined);
                    }}
                    style={isCandleSelected ? { cursor: 'pointer' } : { cursor: 'default' }}
                >
                    {isCandleSelected &&
                        activeTimeFrame === '1d' &&
                        `Showing Transactions ${moment(selectedDate)
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
                        activeTimeFrame !== '1d' &&
                        `Showing Transactions for ${moment(selectedDate).calendar()}`}
                </p>
            </DefaultTooltip>

            {clearButtonOrNull}
        </div>
    );

    useOnClickOutside(tabComponentRef, clickOutsideHandler);

    return (
        <div ref={tabComponentRef} className={styles.trade_tab_container}>
            <>
                {isCandleSelected ? selectedMessageContent : null}
                {expandTradeTable && <TradeChartsTokenInfo {...TradeChartsTokenInfoProps} />}
                <TabComponent
                    data={tradeTabData}
                    rightTabOptions={<PositionsOnlyToggle {...positionsOnlyToggleProps} />}
                    selectedOutsideTab={selectedOutsideTab}
                    setSelectedOutsideTab={setSelectedOutsideTab}
                    outsideControl={outsideControl}
                    setOutsideControl={setOutsideControl}
                    setSelectedInsideTab={setSelectedInsideTab}
                    showPositionsOnlyToggle={showPositionsOnlyToggle}
                    setShowPositionsOnlyToggle={setShowPositionsOnlyToggle}
                />
            </>
        </div>
    );
}
