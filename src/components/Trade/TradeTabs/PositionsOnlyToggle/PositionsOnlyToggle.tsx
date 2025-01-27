import { Dispatch, SetStateAction, useContext } from 'react';
import { MdCloseFullscreen, MdExpand } from 'react-icons/md';
import { CandleDataIF } from '../../../../ambient-utils/types';
import { CandleContext } from '../../../../contexts/CandleContext';
import { ChartContext } from '../../../../contexts/ChartContext';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { FlexContainer, Text } from '../../../../styled/Common';
import { useMediaQuery } from '../../../../utils/hooks/useMediaQuery';
import Toggle from '../../../Form/Toggle';
import { DefaultTooltip } from '../../../Global/StyledTooltip/StyledTooltip';

interface PositionsOnlyToggleProps {
    setTransactionFilter: Dispatch<SetStateAction<CandleDataIF | undefined>>;
    currentTab?: string;
    changeState: (
        isOpen: boolean | undefined,
        candleData: CandleDataIF | undefined,
    ) => void;
    setSelectedDate: React.Dispatch<number | undefined>;
}

const noFilterByUserTabs = ['Leaderboard', 'Info'];

export default function PositionsOnlyToggle(props: PositionsOnlyToggleProps) {
    const { setTransactionFilter, changeState, setSelectedDate } = props;

    const {
        isCandleSelected,
        setIsCandleSelected,

        setIsManualCandleFetchRequested,
    } = useContext(CandleContext);
    const {
        toggleTradeTable,
        toggleTradeTableCollapse,
        showAllData,
        setShowAllData,
    } = useContext(TradeTableContext);

    const { tradeTableState, isCandleDataNull } = useContext(ChartContext);

    const { isUserConnected } = useContext(UserDataContext);

    const expandIcon = (
        <div
            role='button'
            onClick={() => {
                toggleTradeTable();
            }}
        >
            <MdExpand />
        </div>
    );

    const collapseIcon = (
        <div
            role='button'
            onClick={() => {
                toggleTradeTableCollapse();

                if (isCandleDataNull) {
                    setIsManualCandleFetchRequested(true);
                }
            }}
        >
            <MdCloseFullscreen />
        </div>
    );

    const toggleOrNull =
        !isUserConnected ||
        isCandleSelected ||
        // hide toggle if current tab is leaderboard since React state takes time to update
        noFilterByUserTabs.includes(props.currentTab ?? '') ? null : (
            <Toggle
                isOn={!showAllData}
                handleToggle={() => {
                    setShowAllData(!showAllData);
                    if (!showAllData) {
                        setIsCandleSelected(false);
                        setTransactionFilter(undefined);
                    }
                }}
                id='positions_only_toggle'
                disabled={isCandleSelected}
            />
        );

    const unselectCandle = () => {
        setSelectedDate(undefined);
        changeState(false, undefined);
        setIsCandleSelected(false);
    };

    const isDesktopScreen = useMediaQuery('(min-width: 600px)');
    const isTabletScreen = useMediaQuery(
        '(min-width: 768px) and (max-width: 1200px)',
    );

    return (
        <FlexContainer
            alignItems='center'
            gap={8}
            style={{
                transition: 'var(--animation-speed) ease-in-out',
                minHeight: '20px',
            }}
        >
            {toggleOrNull && ( // display toggle if user is logged in and viewing tx/limit/range tables
                <FlexContainer
                    alignItems='center'
                    justifyContent='flex-end'
                    gap={8}
                    margin='0 8px 0 0'
                >
                    {!isTabletScreen && (
                        <Text
                            fontSize='body'
                            color='text2'
                            onClick={() => {
                                unselectCandle();
                            }}
                            style={
                                isCandleSelected
                                    ? { cursor: 'pointer' }
                                    : { cursor: 'default' }
                            }
                        >
                            {isDesktopScreen
                                ? `My ${props.currentTab}`
                                : 'Mine'}
                        </Text>
                    )}

                    <DefaultTooltip
                        interactive
                        title={`My ${props.currentTab}`}
                        placement={'bottom'}
                        arrow
                        enterDelay={700}
                        leaveDelay={200}
                    >
                        {toggleOrNull}
                    </DefaultTooltip>
                </FlexContainer>
            )}
            {tradeTableState !== 'Collapsed' && isDesktopScreen && collapseIcon}
            {tradeTableState !== 'Expanded' && isDesktopScreen && expandIcon}
        </FlexContainer>
    );
}
