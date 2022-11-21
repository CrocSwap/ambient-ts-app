import { Dispatch, SetStateAction } from 'react';
import styles from './ClaimOrderSettings.module.css';
import { BsArrowLeft } from 'react-icons/bs';
import Button from '../../Global/Button/Button';

interface ClaimOrderSettingsPropsIF {
    showSettings: boolean;
    setShowSettings: Dispatch<SetStateAction<boolean>>;
    onBackClick: () => void;
}

export default function ClaimOrderSettings(props: ClaimOrderSettingsPropsIF) {
    // eslint-disable-next-line
    const { showSettings, setShowSettings, onBackClick } = props;

    return (
        <div className={styles.main_container}>
            <div>
                <header className={styles.header_container}>
                    <div onClick={() => setShowSettings(false)}>
                        <BsArrowLeft size={22} />
                    </div>
                    <h2>Order Removal Settings</h2>
                    <div />
                </header>
                <div>Settings data will be here.</div>
            </div>
            <Button title='CONFIRM' action={() => setShowSettings(false)} flat={true} />
        </div>
    );
}
