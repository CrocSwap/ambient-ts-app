import { Dispatch, SetStateAction } from 'react';
import styles from './RemoveRangeSettings.module.css';
import { RiCloseLine } from 'react-icons/ri';

interface RemoveRangeSettingsPropsIF {
    showSettings: boolean;
    setShowSettings: Dispatch<SetStateAction<boolean>>;
}

export default function RemoveRangeSettings(props: RemoveRangeSettingsPropsIF) {
    const { showSettings, setShowSettings } = props;

    const wrapperStyle = showSettings ? styles.settings_wrapper_active : styles.settings_wrapper;
    return (
        <div className={styles.settings_container}>
            <div className={wrapperStyle}>
                <div className={styles.close_icon} onClick={() => setShowSettings(false)}>
                    <RiCloseLine size={20} />
                </div>
            </div>
        </div>
    );
}
