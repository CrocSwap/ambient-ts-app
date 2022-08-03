import styles from './PositionsOnlyToggle.module.css';
import { Dispatch, SetStateAction } from 'react';
import Toggle2 from '../../../Global/Toggle/Toggle2';

interface PositionsOnlyToggleProps {
    isShowAllEnabled: boolean;
    isAuthenticated: boolean;
    isWeb3Enabled: boolean;
    setHasInitialized: Dispatch<SetStateAction<boolean>>;
    setIsShowAllEnabled: Dispatch<SetStateAction<boolean>>;
}

export default function PositionsOnlyToggle(props: PositionsOnlyToggleProps) {
    const {
        isShowAllEnabled,
        isAuthenticated,
        isWeb3Enabled,
        setIsShowAllEnabled,
        setHasInitialized,
    } = props;
    return (
        <div className={styles.options_toggle}>
            {/* <p>{isShowAllEnabled ? 'All ' + label : 'My ' + label}</p> */}
            <p>{isShowAllEnabled ? 'All ' + 'label' : 'My ' + 'label'}</p>

            <Toggle2
                isOn={isShowAllEnabled}
                handleToggle={() => {
                    setHasInitialized(true);
                    console.log('toggle on', !isShowAllEnabled);
                    setIsShowAllEnabled(!isShowAllEnabled);
                }}
                id='positions_only_toggle'
                disabled={!isAuthenticated || !isWeb3Enabled}
            />
        </div>
    );
}
