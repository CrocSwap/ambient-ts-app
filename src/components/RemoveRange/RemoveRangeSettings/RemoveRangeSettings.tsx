import { Dispatch, SetStateAction } from 'react';
import styles from './RemoveRangeSettings.module.css';
import { RiCloseLine } from 'react-icons/ri';

interface RemoveRangeSettingsPropsIF {
    showSettings: boolean;
    setShowSettings: Dispatch<SetStateAction<boolean>>;
}

export default function RemoveRangeSettings(props: RemoveRangeSettingsPropsIF) {
    const { showSettings, setShowSettings } = props;

    // console.log(showSettings);

    return (
        <div className={styles.settings_container}>
            {showSettings && (
                <div className={styles.close_button} onClick={() => setShowSettings(false)}>
                    <RiCloseLine size={25} />
                </div>
            )}
            <h4>Remove Range Settings</h4>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Labore, veniam obcaecati. Sit
            perspiciatis natus porro nesciunt quasi, voluptatem atque, aut corrupti.
        </div>
    );
}
