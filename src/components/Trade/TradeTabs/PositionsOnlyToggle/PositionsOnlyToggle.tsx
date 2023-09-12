import { Dispatch, SetStateAction, useContext } from 'react';
import Toggle from '../../../Global/Toggle/Toggle';
import { MdExpand, MdCloseFullscreen } from 'react-icons/md';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { CandleContext } from '../../../../contexts/CandleContext';
import { CandleData } from '../../../../App/functions/fetchCandleSeries';
import { ChartContext } from '../../../../contexts/ChartContext';
import { FlexContainer, Text } from '../../../../styled/Common';

interface PositionsOnlyToggleProps {
    setTransactionFilter: Dispatch<SetStateAction<CandleData | undefined>>;
    currentTab?: string;
    changeState: (
        isOpen: boolean | undefined,
        candleData: CandleData | undefined,
    ) => void;
    setSelectedDate: React.Dispatch<number | undefined>;
    setHasUserSelectedViewAll: Dispatch<SetStateAction<boolean>>;
}

const noFilterByUserTabs = ['Leaderboard', 'Info'];

export default function PositionsOnlyToggle(props: PositionsOnlyToggleProps) {
    const {
        setTransactionFilter,
        changeState,
        setSelectedDate,
        setHasUserSelectedViewAll,
    } = props;

    const {
        isCandleSelected,
        setIsCandleSelected,
        isCandleDataNull,
        setIsManualCandleFetchRequested,
    } = useContext(CandleContext);
    const {
        toggleTradeTable,
        toggleTradeTableCollapse,
        showAllData,
        setShowAllData,
    } = useContext(TradeTableContext);

    const { tradeTableState } = useContext(ChartContext);

    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );

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
                    setHasUserSelectedViewAll(true);
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
                        {`My ${props.currentTab}`}
                    </Text>
                    {toggleOrNull}
                </FlexContainer>
            )}
            {tradeTableState !== 'Collapsed' && collapseIcon}
            {tradeTableState !== 'Expanded' && expandIcon}
        </FlexContainer>
    );
}
