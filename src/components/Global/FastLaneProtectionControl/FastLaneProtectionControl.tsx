import { Dispatch, SetStateAction, useId } from 'react';
import Toggle from '../../Form/Toggle';
import styles from './FastLaneProtectionControl.module.css';

interface propsIF {
    tempEnableFastLane: boolean;
    setTempEnableFastLane: Dispatch<SetStateAction<boolean>>;
    displayInSettings?: boolean;
}

export default function FastLaneProtectionControl(props: propsIF) {
    const { tempEnableFastLane, setTempEnableFastLane, displayInSettings } = props;
    const compKey = useId();
    const toggleAriaLabel = `${
        tempEnableFastLane ? 'disable' : 'enable'
    } MEV protection by Fastlane`;

    return (
        <div className={styles.main_container}>
            {displayInSettings ? (
                <p tabIndex={0}>{'Enable MEV-Protection by Fastlane'}</p>
            ) : (
                <p tabIndex={0}>Enable MEV-Protection by Fastlane</p>
            )}
            <Toggle
                key={compKey}
                isOn={tempEnableFastLane}
                disabled={false}
                handleToggle={() => setTempEnableFastLane(!tempEnableFastLane)}
                id='enable_fastlane_toggle'
                aria-label={toggleAriaLabel}
            />
        </div>
    );
}
