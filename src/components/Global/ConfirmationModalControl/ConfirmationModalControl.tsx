import { useId, Dispatch, SetStateAction, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Toggle2 from '../Toggle/Toggle2';
import styles from './ConfirmationModalControl.module.css';

interface propsIF {
    currentSkipConfirm: boolean;
    setCurrentSkipConfirm: Dispatch<SetStateAction<boolean>>;
    toggleFor: string;
    displayInSettings?: boolean;
}

export default function ConfirmationModalControl(props: propsIF) {
    const { currentSkipConfirm, setCurrentSkipConfirm, displayInSettings } =
        props;

    const { pathname } = useLocation();

    const compKey = useId();

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

    useEffect(() => console.log('initial value is: ' + currentSkipConfirm), []);

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
                isOn={currentSkipConfirm}
                disabled={false}
                handleToggle={() => {
                    setCurrentSkipConfirm(!currentSkipConfirm);
                    console.log('toggled!!');
                }}
                id='disabled_confirmation_modal_toggle'
            />
        </div>
    );
}
