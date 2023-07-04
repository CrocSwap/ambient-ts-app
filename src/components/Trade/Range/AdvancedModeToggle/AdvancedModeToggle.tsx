import styles from './AdvancedModeToggle.module.css';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { toggleAdvancedMode } from '../../../../utils/state/tradeDataSlice';
import Toggle2 from '../../../Global/Toggle/Toggle2';
import { memo } from 'react';

interface advancedModePropsIF {
    advancedMode: boolean;
}

function AdvancedModeToggle(props: advancedModePropsIF) {
    const { advancedMode } = props;

    const dispatch = useAppDispatch();
    const handleToggle = () => dispatch(toggleAdvancedMode());

    return (
        <div
            className={styles.advanced_toggle}
            id='range_advance_mode_toggle'
            aria-label='Advanced mode toggle'
        >
            <Toggle2
                isOn={!advancedMode}
                handleToggle={handleToggle}
                id='advanced_reposition'
            />
            <h4 className={styles.advanced_toggle_title}>
                {'Balanced'}
                {/* {advancedMode ? 'Advanced Mode' : 'Balanced Mode'} */}
            </h4>
        </div>
    );
}

export default memo(AdvancedModeToggle);
