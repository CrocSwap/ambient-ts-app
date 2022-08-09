import styles from './PositionsOnlyToggle.module.css';
import { Dispatch, SetStateAction } from 'react';
import Toggle2 from '../../../Global/Toggle/Toggle2';
import { MdExpand, MdCloseFullscreen } from 'react-icons/md';

interface PositionsOnlyToggleProps {
    isShowAllEnabled: boolean;
    isAuthenticated: boolean;
    isWeb3Enabled: boolean;
    setHasInitialized: Dispatch<SetStateAction<boolean>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
    setIsCandleSelected: Dispatch<SetStateAction<boolean>>;
    setTransactionFilter: Dispatch<SetStateAction<any>>;

    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
    currentTab?: string;
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
    } = props;

    // console.log(props);

    const expandIcon = (
        <div className={styles.icon} onClick={() => setExpandTradeTable(!expandTradeTable)}>
            {expandTradeTable ? <MdCloseFullscreen /> : <MdExpand />}
        </div>
    );

    return (
        <div className={styles.main_container}>
            <div className={styles.options_toggle}>
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
                            setTransactionFilter({ time: null, poolHash: null });
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
