import Toggle2 from '../Toggle/Toggle2';
import styles from './ConfirmationModalControl.module.css';
import { useState } from 'react';

export default function ConfirmationModalControl() {
    // This state will be replaced by either a variable stored in RTK or local storage

    const [disableConfirmationModal, setDisableConfirmationModal] = useState(false);

    // If we want every modal to have their own toggle, we can simply pass an id as a prop and replace the id of the toggle with that id.
    return (
        <div className={styles.main_container}>
            <p>Don&apos;t show this confirmation modal again</p>
            <Toggle2
                isOn={disableConfirmationModal}
                disabled={false}
                handleToggle={() => setDisableConfirmationModal(!disableConfirmationModal)}
                id='disabled_confirmation_modal_toggle'
            />
        </div>
    );
}
