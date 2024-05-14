import {
    useEffect,
    Dispatch,
    SetStateAction,
    useRef,
    useContext,
    memo,
} from 'react';

import Transactions from './Transactions/Transactions';
import Orders from './Orders/Orders';
import moment from 'moment';
import leaderboard from '../../../assets/images/leaderboard.svg';
import infoSvg from '../../../assets/images/info.svg';
import openOrdersImage from '../../../assets/images/sidebarImages/openOrders.svg';
import rangePositionsImage from '../../../assets/images/sidebarImages/rangePositions.svg';
import recentTransactionsImage from '../../../assets/images/sidebarImages/recentTx.svg';
import Ranges from './Ranges/Ranges';
import TabComponent from '../../Global/TabComponent/TabComponent';
import PositionsOnlyToggle from './PositionsOnlyToggle/PositionsOnlyToggle';
import Leaderboard from './Ranges/Leaderboard';
import { DefaultTooltip } from '../../Global/StyledTooltip/StyledTooltip';
import { CandleContext } from '../../../contexts/CandleContext';
import { ChartContext } from '../../../contexts/ChartContext';
import { CandleDataIF } from '../../../ambient-utils/types';
import { FlexContainer } from '../../../styled/Common';
import { ClearButton } from '../../../styled/Components/TransactionTable';
import TableInfo from '../TableInfo/TableInfo';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
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
    };

    // Props for <Transactions/> React Element
    const transactionsProps = {
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

    const positionsOnlyToggleProps = {
        setTransactionFilter,
        changeState,
        setSelectedDate,
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
                  label: 'Leaderboard',
                  content: <Leaderboard />,
                  icon: leaderboard,
                  showRightSideOption: false,
              },
              {
                  label: 'Info',
                  content: <TableInfo />,
                  icon: infoSvg,
                  showRightSideOption: false,
                  //   onClick: handleChartHeightOnInfo,
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
            style={{ position: 'relative', zIndex: 21 }}
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
                />
            </FlexContainer>
        </FlexContainer>
    );
}

export default memo(TradeTabs2);
