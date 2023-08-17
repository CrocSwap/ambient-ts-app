import styles from './PositionsOnlyToggle.module.css';
import { Dispatch, SetStateAction, useContext } from 'react';
import Toggle from '../../../Global/Toggle/Toggle';
import { MdExpand, MdCloseFullscreen } from 'react-icons/md';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
import { CandleContext } from '../../../../contexts/CandleContext';
import { CandleData } from '../../../../App/functions/fetchCandleSeries';

interface PositionsOnlyToggleProps {
    setTransactionFilter: Dispatch<SetStateAction<CandleData | undefined>>;
    currentTab?: string;
    showPositionsOnlyToggle?: boolean;
    changeState: (
        isOpen: boolean | undefined,
        candleData: CandleData | undefined,
    ) => void;
    setSelectedDate: React.Dispatch<number | undefined>;
    isCandleArrived: boolean;
    setIsCandleDataArrived: Dispatch<SetStateAction<boolean>>;
    setHasUserSelectedViewAll: Dispatch<SetStateAction<boolean>>;
}

const LeaderboardTabName = 'Leaderboard';

export default function PositionsOnlyToggle(props: PositionsOnlyToggleProps) {
    const {
        setTransactionFilter,
        showPositionsOnlyToggle,
        changeState,
        setSelectedDate,
        isCandleArrived,
        setIsCandleDataArrived,
        setHasUserSelectedViewAll,
    } = props;

    const {
        isCandleSelected,
        setIsCandleSelected,
        isCandleDataNull,
        setIsManualCandleFetchRequested,
    } = useContext(CandleContext);
    const {
        tradeTableState,
        toggleTradeTable,
        toggleTradeTableCollapse,
        showAllData,
        setShowAllData,
    } = useContext(TradeTableContext);

    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );

    const expandIcon = (
        <div
            className={styles.icon}
            onClick={() => {
                toggleTradeTable();
                setIsCandleDataArrived(false);
            }}
        >
            <MdExpand />
            {isCandleArrived && (
                <span className={styles.graph_indicator}></span>
            )}
        </div>
    );

    const collapseIcon = (
        <div
            className={styles.icon}
            onClick={() => {
                toggleTradeTableCollapse();
                setIsCandleDataArrived(false);

                if (isCandleDataNull) {
                    setIsManualCandleFetchRequested(true);
                }
            }}
        >
            <MdCloseFullscreen />
            {isCandleArrived && (
                <span className={styles.graph_indicator}></span>
            )}
        </div>
    );

    const toggleOrNull =
        !isUserConnected ||
        isCandleSelected ||
        // hide toggle if current tab is leaderboard since React state takes time to update
        props.currentTab == LeaderboardTabName ? null : (
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
        <div className={styles.main_container}>
            <div
                className={`${styles.options_toggle} ${
                    !showPositionsOnlyToggle && styles.disable_right
                }`}
            >
                <p
                    onClick={() => {
                        unselectCandle();
                    }}
                    style={
                        isCandleSelected
                            ? { cursor: 'pointer' }
                            : { cursor: 'default' }
                    }
                >
                    {isUserConnected &&
                    !isCandleSelected &&
                    // hide toggle if current tab is leaderboard since React state takes time to update
                    props.currentTab !== LeaderboardTabName
                        ? `My ${props.currentTab}`
                        : null}
                </p>
                {toggleOrNull}
            </div>
            {tradeTableState != 'Collapsed' && collapseIcon}
            {tradeTableState != 'Expanded' && expandIcon}
        </div>
    );
}
