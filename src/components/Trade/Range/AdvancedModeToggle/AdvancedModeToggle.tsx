import styles from './AdvancedModeToggle.module.css';
import Toggle from '../../../Global/Toggle/Toggle';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { toggleAdvancedMode } from '../../../../utils/state/tradeDataSlice';

interface advancedModePropsIF {
    advancedMode: boolean;
}

export default function AdvancedModeToggle(props: advancedModePropsIF) {
    const { advancedMode } = props;

    const dispatch = useAppDispatch();
    const handleToggle = () => dispatch(toggleAdvancedMode());

    return (
        <div className={styles.advanced_toggle}>
            <h4 className={styles.advanced_toggle_title}>Advanced Mode</h4>
            <div className={styles.advanced_toggle_container}>
                <Toggle
                    isOn={advancedMode}
                    handleToggle={handleToggle}
                    Width={36}
                    id='advanced_reposition'
                />
            </div>
        </div>
    );
}
