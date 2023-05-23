import styles from './PositionsOnlyToggle.module.css';
import { Dispatch, SetStateAction, useContext } from 'react';
import Toggle2 from '../../../Global/Toggle/Toggle2';
import { MdExpand, MdCloseFullscreen } from 'react-icons/md';
import { CandleData } from '../../../../utils/state/graphDataSlice';
import { GiLaurelsTrophy } from 'react-icons/gi';
import { NavLink } from 'react-router-dom';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { TradeTableContext } from '../../../../contexts/TradeTableContext';
interface PositionsOnlyToggleProps {
    setHasInitialized: Dispatch<SetStateAction<boolean>>;
    isCandleSelected: boolean | undefined;
    setIsCandleSelected: Dispatch<SetStateAction<boolean | undefined>>;
    setTransactionFilter: Dispatch<SetStateAction<CandleData | undefined>>;
    currentTab?: string;
    showPositionsOnlyToggle?: boolean;
    setShowPositionsOnlyToggle?: Dispatch<SetStateAction<boolean>>;
    leader: string;
    leaderOwnerId: string;
    changeState: (
        isOpen: boolean | undefined,
        candleData: CandleData | undefined,
    ) => void;
    selectedDate: number | undefined;
    setSelectedDate: React.Dispatch<number | undefined>;
    isCandleDataNull: boolean;
    isCandleArrived: boolean;
    setIsCandleDataArrived: Dispatch<SetStateAction<boolean>>;
    setHasUserSelectedViewAll: Dispatch<SetStateAction<boolean>>;
}

const LeaderboardTabName = 'Leaderboard';

export default function PositionsOnlyToggle(props: PositionsOnlyToggleProps) {
    const {
        isCandleSelected,
        setIsCandleSelected,
        setTransactionFilter,
        // setHasInitialized,
        showPositionsOnlyToggle,
        leader,
        leaderOwnerId,
        changeState,

        setSelectedDate,
        isCandleDataNull,
        isCandleArrived,
        setIsCandleDataArrived,
        setHasUserSelectedViewAll,
        // setShowPositionsOnlyToggle
    } = props;

    const {
        expandTradeTable,
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
                setExpandTradeTable(!expandTradeTable);
                setIsCandleDataArrived(false);
            }}
        >
            {expandTradeTable ? <MdCloseFullscreen /> : <MdExpand />}
            {isCandleArrived && <span className={styles.graph_indicaor}></span>}
        </div>
    );
    // <NavLink to={`/${ownerId}`}>View Account</NavLink>

    const leaderName = (
        <NavLink to={`/${leaderOwnerId}`} className={styles.leader}>
            <h3>{leader}</h3>
            <GiLaurelsTrophy size={25} color='#d4af37' />
        </NavLink>
    );

    if (leader !== '' && !showPositionsOnlyToggle) return leaderName;

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
