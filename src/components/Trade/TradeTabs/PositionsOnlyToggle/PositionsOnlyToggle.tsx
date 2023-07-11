import styles from './PositionsOnlyToggle.module.css';
import { Dispatch, SetStateAction, useContext } from 'react';
import Toggle2 from '../../../Global/Toggle/Toggle2';
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

    const { isCandleSelected, setIsCandleSelected, isCandleDataNull } =
        useContext(CandleContext);
    const {
        isTradeTableExpanded,
        setExpandTradeTable,
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
                setExpandTradeTable(!isTradeTableExpanded);
                setIsCandleDataArrived(false);
            }}
        >
            {isTradeTableExpanded ? <MdCloseFullscreen /> : <MdExpand />}
            {isCandleArrived && <span className={styles.graph_indicaor}></span>}
        </div>
    );

    const toggleOrNull =
        !isUserConnected ||
        isCandleSelected ||
        // hide toggle if current tab is leaderboard since React state takes time to update
        props.currentTab == LeaderboardTabName ? null : (
            <Toggle2
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

    // const clearButtonOrNull = isCandleSelected ? (
    //     <button className={styles.option_button} onClick={() => unselectCandle()}>
    //         Clear
    //     </button>
    // ) : null;

    return (
        <div className={styles.main_container}>
            <div
                className={`${styles.options_toggle} ${
                    !showPositionsOnlyToggle && styles.disable_right
                }`}
            >
                {/* <p>{isShowAllEnabled ? 'All ' + label : 'My ' + label}</p> */}
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
                {/* <p>{`All ${props.currentTab}`}</p> */}
                {/* {clearButtonOrNull} */}
                {toggleOrNull}
            </div>
            {(!isCandleDataNull || isCandleArrived) && expandIcon}
        </div>
    );
}
