import { useId, useState } from 'react';
import Toggle2 from '../Toggle/Toggle2';
import styles from './ConfirmationModalControl.module.css';

interface propsIF {
    bypassConfirm: boolean;
    toggleBypassConfirm: (item: string, pref: boolean) => void;
    toggleFor: string;
}

export default function ConfirmationModalControl(props: propsIF) {
    const { bypassConfirm, toggleBypassConfirm, toggleFor } = props;
    const compKey = useId();

    const [isBypassToggleEnabledLocal, setIsBypassToggleEnabledLocal] = useState(bypassConfirm);

    // TODO:   @Junior  unless the `id` field is being used for DOM manipulation
    // TODO:   @Junior  ... or for CSS targeting, just take it out and use the
    // TODO:   @Junior  ... `compKey` value instead (also delete this TODO note)

    return (
        <div className={styles.main_container}>
            <p>Skip this step in the future</p>
            <Toggle2
                key={compKey}
                isOn={isBypassToggleEnabledLocal}
                disabled={false}
                handleToggle={() => {
                    console.log('setting to: ' + !isBypassToggleEnabledLocal);
                    setIsBypassToggleEnabledLocal(!isBypassToggleEnabledLocal);
                    toggleBypassConfirm(toggleFor, !isBypassToggleEnabledLocal);
                }}
                id='disabled_confirmation_modal_toggle'
            />
        </div>
    );
}
