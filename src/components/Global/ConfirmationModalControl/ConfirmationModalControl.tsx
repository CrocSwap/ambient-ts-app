import Toggle2 from '../Toggle/Toggle2';
import styles from './ConfirmationModalControl.module.css';
import { useState } from 'react';

export default function ConfirmationModalControl() {
    const [disableConfirmationModal, setDisableConfirmationModal] = useState(false);
    return (
        <div className={styles.main_container}>
            <Toggle2
                isOn={disableConfirmationModal}
                disabled={false}
                handleToggle={() => setDisableConfirmationModal(!disableConfirmationModal)}
                id='disabled_confirmation_modal_toggle'
            />
        </div>
    );
}
