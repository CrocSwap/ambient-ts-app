import styles from './PositionsOnlyToggle.module.css';
import { Dispatch, SetStateAction } from 'react';
import Toggle2 from '../../../Global/Toggle/Toggle2';
import { MdExpand, MdCloseFullscreen } from 'react-icons/md';
import { CandleData } from '../../../../utils/state/graphDataSlice';
import { GiLaurelsTrophy } from 'react-icons/gi';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
interface PositionsOnlyToggleProps {
    isShowAllEnabled: boolean;
    isAuthenticated: boolean;
    isWeb3Enabled: boolean;
    setHasInitialized: Dispatch<SetStateAction<boolean>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    isCandleSelected: boolean | undefined;
    setIsCandleSelected: Dispatch<SetStateAction<boolean | undefined>>;
    setTransactionFilter: Dispatch<SetStateAction<CandleData | undefined>>;

    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
    currentTab?: string;

    showPositionsOnlyToggle?: boolean;
    setShowPositionsOnlyToggle?: Dispatch<SetStateAction<boolean>>;
    leader: string;
    leaderOwnerId: string;
    changeState: (isOpen: boolean | undefined, candleData: CandleData | undefined) => void;
    selectedDate: Date | undefined;
    setSelectedDate: React.Dispatch<Date | undefined>;
}

export default function PositionsOnlyToggle(props: PositionsOnlyToggleProps) {
    const {
        isShowAllEnabled,
        isAuthenticated,
        isWeb3Enabled,
        setIsShowAllEnabled,
        isCandleSelected,
        setIsCandleSelected,
        setTransactionFilter,
        setHasInitialized,
        expandTradeTable,
        setExpandTradeTable,
        showPositionsOnlyToggle,
        leader,
        leaderOwnerId,
        changeState,
        selectedDate,
        setSelectedDate,
        // setShowPositionsOnlyToggle
    } = props;

    const expandIcon = (
        <div className={styles.icon} onClick={() => setExpandTradeTable(!expandTradeTable)}>
            {expandTradeTable ? <MdCloseFullscreen /> : <MdExpand />}
        </div>
    );
    // <NavLink to={`/${ownerId}`}>View Account</NavLink>

    // console.log(leaderOwnerId);
    const leaderName = (
        <NavLink to={`/${leaderOwnerId}`} className={styles.leader}>
            <h3>{leader}</h3>
            <GiLaurelsTrophy size={25} color='#d4af37' />
        </NavLink>
    );

    if (leader !== '' && !showPositionsOnlyToggle) return leaderName;

    const toggleOrNull = isCandleSelected ? null : (
        <Toggle2
            isOn={!isShowAllEnabled}
            handleToggle={() => {
                setHasInitialized(true);
                // console.log('toggle on', !isShowAllEnabled);
                console.log('toggling show all');
                setIsShowAllEnabled(!isShowAllEnabled);
                if (!isShowAllEnabled) {
                    setIsCandleSelected(false);
                    setTransactionFilter(undefined);
                }
            }}
            id='positions_only_toggle'
            disabled={!isAuthenticated || !isWeb3Enabled || isCandleSelected}
        />
    );

    const unselectCandle = () => {
        setSelectedDate(undefined);
        changeState(false, undefined);
        setIsCandleSelected(false);
    };

    const clearButtonOrNull = isCandleSelected ? (
        <button className={styles.option_button} onClick={() => unselectCandle()}>
            Clear
        </button>
    ) : null;

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
                        // setIsCandleSelected(false);
                        // setTransactionFilter(undefined);
                    }}
                    style={isCandleSelected ? { cursor: 'pointer' } : { cursor: 'default' }}
                >
                    {isCandleSelected
                        ? `Showing Transactions for ${moment(selectedDate).calendar()}`
                        : `My ${props.currentTab}`}
                </p>
                {/* <p>{`All ${props.currentTab}`}</p> */}
                {clearButtonOrNull}
                {toggleOrNull}
            </div>
            {expandIcon}
        </div>
    );
}
