import { Dispatch, SetStateAction, useId } from 'react';
import { useLocation } from 'react-router-dom';
import Toggle from '../../Form/Toggle';
import styles from './ConfirmationModalControl.module.css';

interface propsIF {
    tempBypassConfirm: boolean;
    setTempBypassConfirm: Dispatch<SetStateAction<boolean>>;
    displayInSettings?: boolean;
}

export default function ConfirmationModalControl(props: propsIF) {
    const { tempBypassConfirm, setTempBypassConfirm, displayInSettings } =
        props;

    const { pathname } = useLocation();

    const compKey = useId();

    const moduleName = pathname.includes('swap')
        ? 'swaps'
        : pathname.includes('market')
          ? 'swaps'
          : pathname.includes('pool')
            ? 'pool orders'
            : pathname.includes('reposition')
              ? 'repositions'
              : pathname.includes('limit')
                ? 'limit orders'
                : 'unhandled';

    const toggleAriaLabel = `${
        tempBypassConfirm ? 'disable skip' : 'skip'
    } the Confirmation Step for ${moduleName}`;

    return (
        <div className={styles.main_container}>
            {displayInSettings ? (
                <p
                    tabIndex={0}
                >{`Skip the confirmation step for ${moduleName}`}</p>
            ) : (
                <p tabIndex={0}>Skip this confirmation step in the future</p>
            )}
            <Toggle
                key={compKey}
                isOn={tempBypassConfirm}
                disabled={false}
                handleToggle={() => setTempBypassConfirm(!tempBypassConfirm)}
                id='disabled_confirmation_modal_toggle'
                aria-label={toggleAriaLabel}
            />
        </div>
    );
}
