import styles from './AdvancedModeToggle.module.css';
import Toggle from '../../../Global/Toggle/Toggle';

interface advancedModeProps {
    toggleAdvancedMode: (event: React.ChangeEvent<HTMLDivElement>) => void;
    advancedMode: boolean;
}

export default function AdvancedModeToggle(props: advancedModeProps) {
    const { toggleAdvancedMode, advancedMode } = props;

    const advancedModeToggle = (
        <div className={styles.advanced_toggle}>
            <span className={styles.advanced_toggle_title}>Advanced Mode</span>
            <div className={styles.advanced_toggle_container}>
                <Toggle
                    isOn={advancedMode}
                    handleToggle={toggleAdvancedMode}
                    Width={36}
                    id='advanced_reposition'
                />
            </div>
        </div>
    );

    return <div className={styles.AdvancedMode}>{advancedModeToggle}</div>;
}
