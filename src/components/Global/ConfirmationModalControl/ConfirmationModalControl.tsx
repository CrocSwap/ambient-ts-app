import { useId, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Toggle2 from '../Toggle/Toggle2';
import styles from './ConfirmationModalControl.module.css';

interface propsIF {
    bypassConfirm: boolean;
    toggleBypassConfirm: (item: string, pref: boolean) => void;
    toggleFor: string;
    displayInSettings?: boolean;
}

export default function ConfirmationModalControl(props: propsIF) {
    const { bypassConfirm, toggleBypassConfirm, toggleFor, displayInSettings } = props;

    const { pathname } = useLocation();

    const compKey = useId();

    const [isBypassToggleEnabledLocal, setIsBypassToggleEnabledLocal] = useState(bypassConfirm);

    // TODO:   @Junior  unless the `id` field is being used for DOM manipulation
    // TODO:   @Junior  ... or for CSS targeting, just take it out and use the
    // TODO:   @Junior  ... `compKey` value instead (also delete this TODO note)

    const moduleName = pathname.includes('swap')
        ? 'Swaps'
        : pathname.includes('market')
        ? 'Market Orders'
        : pathname.includes('limit')
        ? 'Limit Orders'
        : pathname.includes('range')
        ? 'Range Orders'
        : pathname.includes('reposition')
        ? 'Repositions'
        : 'unhandled';

    const label = displayInSettings ? (
        <p>{`Skip the Confirmation Step for ${moduleName}`}</p>
    ) : (
        <p>Skip this confirmation step in the future</p>
    );
    return (
        <div className={styles.main_container}>
            {label}
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
