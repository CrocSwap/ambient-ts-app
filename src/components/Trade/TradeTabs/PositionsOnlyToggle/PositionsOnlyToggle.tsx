import styles from './PositionsOnlyToggle.module.css';
import { Dispatch, SetStateAction } from 'react';
import Toggle2 from '../../../Global/Toggle/Toggle2';
import { MdExpand, MdCloseFullscreen } from 'react-icons/md';
import { CandleData } from '../../../../utils/state/graphDataSlice';
import { GiLaurelsTrophy } from 'react-icons/gi';
import { NavLink } from 'react-router-dom';
interface PositionsOnlyToggleProps {
    isShowAllEnabled: boolean;
    isAuthenticated: boolean;
    isWeb3Enabled: boolean;
    setHasInitialized: Dispatch<SetStateAction<boolean>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    setIsCandleSelected: Dispatch<SetStateAction<boolean | undefined>>;
    setTransactionFilter: Dispatch<SetStateAction<CandleData | undefined>>;

    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
    currentTab?: string;

    showPositionsOnlyToggle?: boolean;
    setShowPositionsOnlyToggle?: Dispatch<SetStateAction<boolean>>;
    leader: string;
    leaderOwnerId: string;
}

export default function PositionsOnlyToggle(props: PositionsOnlyToggleProps) {
    const {
        isShowAllEnabled,
        isAuthenticated,
        isWeb3Enabled,
        setIsShowAllEnabled,
        setIsCandleSelected,
        setTransactionFilter,
        setHasInitialized,
        expandTradeTable,
        setExpandTradeTable,
        showPositionsOnlyToggle,
        leader,
        leaderOwnerId,
        // setShowPositionsOnlyToggle
    } = props;

    // console.log(props);

    const expandIcon = (
        <div className={styles.icon} onClick={() => setExpandTradeTable(!expandTradeTable)}>
            {expandTradeTable ? <MdCloseFullscreen /> : <MdExpand />}
        </div>
    );
    // <NavLink to={`/${ownerId}`}>View Account</NavLink>

    console.log(leaderOwnerId);
    const leaderName = (
        <NavLink to={`/${leaderOwnerId}`} className={styles.leader}>
            <h3>{leader}</h3>
            <GiLaurelsTrophy size={25} color='#d4af37' />
        </NavLink>
    );

    if (leader !== '' && !showPositionsOnlyToggle) return leaderName;

    return (
        <div className={styles.main_container}>
            <div
                className={`${styles.options_toggle} ${
                    !showPositionsOnlyToggle && styles.disable_right
                }`}
            >
                {/* <p>{isShowAllEnabled ? 'All ' + label : 'My ' + label}</p> */}

                <p>{`All ${props.currentTab}`}</p>

                <Toggle2
                    isOn={isShowAllEnabled}
                    handleToggle={() => {
                        setHasInitialized(true);
                        console.log('toggle on', !isShowAllEnabled);
                        setIsShowAllEnabled(!isShowAllEnabled);
                        if (!isShowAllEnabled) {
                            setIsCandleSelected(false);
                            setTransactionFilter(undefined);
                        }
                    }}
                    id='positions_only_toggle'
                    disabled={!isAuthenticated || !isWeb3Enabled}
                />
            </div>
            {expandIcon}
        </div>
    );
}
