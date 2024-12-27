import {
    Dispatch,
    memo,
    SetStateAction,
    useContext,
    useEffect,
    useRef,
} from 'react';

import moment from 'moment';
import { CandleDataIF } from '../../../ambient-utils/types';
import infoSvg from '../../../assets/images/info.svg';
import openOrdersImage from '../../../assets/images/sidebarImages/openOrders.svg';
import rangePositionsImage from '../../../assets/images/sidebarImages/rangePositions.svg';
import recentTransactionsImage from '../../../assets/images/sidebarImages/recentTx.svg';
import { CandleContext } from '../../../contexts/CandleContext';
import { ChartContext } from '../../../contexts/ChartContext';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { FlexContainer } from '../../../styled/Common';
import { ClearButton } from '../../../styled/Components/TransactionTable';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { DefaultTooltip } from '../../Global/StyledTooltip/StyledTooltip';
import TabComponent from '../../Global/TabComponent/TabComponent';
import TableInfo from '../TableInfo/TableInfo';
import Orders from './Orders/Orders';
import PositionsOnlyToggle from './PositionsOnlyToggle/PositionsOnlyToggle';
import Ranges from './Ranges/Ranges';
import Transactions from './Transactions/Transactions';
interface propsIF {
    filter: CandleDataIF | undefined;
    setTransactionFilter: Dispatch<SetStateAction<CandleDataIF | undefined>>;
    changeState: (
        isOpen: boolean | undefined,
        candleData: CandleDataIF | undefined,
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
        setHasInitialized,
        unselectCandle,
    } = props;

    const { chartSettings, tradeTableState } = useContext(ChartContext);
    const candleTime = chartSettings.candleTime.global;

    const { isCandleSelected } = useContext(CandleContext);

    const { baseToken, quoteToken } = useContext(TradeDataContext);

    const { isUserConnected, userAddress } = useContext(UserDataContext);

    const smallScreen = useMediaQuery('(max-width: 768px)');
    const isTabletScreen = useMediaQuery(
        '(min-width: 768px) and (max-width: 1200px)',
    );

    const selectedBaseAddress = baseToken.address;
    const selectedQuoteAddress = quoteToken.address;

    useEffect(() => {
        setHasInitialized(false);
    }, [
        userAddress,
        isUserConnected,
        selectedBaseAddress,
        selectedQuoteAddress,
    ]);

    // -------------------------------DATA-----------------------------------------

    // Props for <Ranges/> React Element
    const rangesProps = {
        notOnTradeRoute: false,
        isAccountView: false,
        unselectCandle,
    };

    // Props for <Transactions/> React Element
    const transactionsProps = {
        filter,
        changeState,
        setSelectedDate,
        isAccountView: false,
        unselectCandle,
    };

    // Props for <Orders/> React Element
    const ordersProps = {
        changeState,
        isAccountView: false,
        unselectCandle,
    };

    const positionsOnlyToggleProps = {
        setTransactionFilter,
        changeState,
        setSelectedDate,
        unselectCandle,
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
                  label: 'Liquidity',
                  content: <Ranges {...rangesProps} />,
                  icon: rangePositionsImage,
                  showRightSideOption: true,
              },
              {
                  label: 'Info',
                  content: <TableInfo />,
                  icon: infoSvg,
                  showRightSideOption: false,
                  //   onClick: handleChartHeightOnInfo,
              },
          ];
    const tradeTabDataMobile = isCandleSelected
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
                  showRightSideOption: false,
              },
              {
                  label: 'Limits',
                  content: <Orders {...ordersProps} />,
                  icon: openOrdersImage,
                  showRightSideOption: false,
              },
              {
                  label: 'Liquidity',
                  content: <Ranges {...rangesProps} />,
                  icon: rangePositionsImage,
                  showRightSideOption: false,
              },
          ];

    const tradeTabDataTablet = isCandleSelected
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
                  showRightSideOption: false,
              },
              {
                  label: 'Limits',
                  content: <Orders {...ordersProps} />,
                  icon: openOrdersImage,
                  showRightSideOption: false,
              },
              {
                  label: 'Liquidity',
                  content: <Ranges {...rangesProps} />,
                  icon: rangePositionsImage,
                  showRightSideOption: false,
              },
          ];

    // -------------------------------END OF DATA-----------------------------------------
    const tabComponentRef = useRef<HTMLDivElement>(null);

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

    return (
        <FlexContainer
            ref={tabComponentRef}
            fullWidth
            fullHeight
            padding='8px'
            style={{ position: 'relative', zIndex: 1 }}
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
                    border: smallScreen ? '1px solid var(--dark3)' : '',
                }}
            >
                {isCandleSelected ? selectedMessageContent : null}
                <TabComponent
                    data={
                        smallScreen
                            ? tradeTabDataMobile
                            : isTabletScreen
                              ? tradeTabDataTablet
                              : tradeTabData
                    }
                    rightTabOptions={
                        !smallScreen && (
                            <PositionsOnlyToggle
                                {...positionsOnlyToggleProps}
                            />
                        )
                    }
                />
            </FlexContainer>
        </FlexContainer>
    );
}

export default memo(TradeTabs2);
