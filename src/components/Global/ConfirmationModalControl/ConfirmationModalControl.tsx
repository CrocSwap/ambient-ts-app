import { useId } from 'react';
import Toggle2 from '../Toggle/Toggle2';
import styles from './ConfirmationModalControl.module.css';

interface propsIF {
    dontConfirm: boolean;
    toggleDontConfirm: (item: string, pref: boolean) => void;
}

export default function ConfirmationModalControl(props: propsIF) {
    const { dontConfirm, toggleDontConfirm } = props;
    const compKey = useId();

    // TODO:   @Junior  unless the `id` field is being used for DOM manipulation
    // TODO:   @Junior  ... or for CSS targeting, just take it out and use the
    // TODO:   @Junior  ... `compKey` value instead (also delete this TODO note)

    return (
        <div className={styles.main_container}>
            <p>Do not show this confirmation modal again</p>
            <Toggle2
                key={compKey}
                isOn={dontConfirm}
                disabled={false}
                handleToggle={() => toggleDontConfirm('swap', !dontConfirm)}
                id='disabled_confirmation_modal_toggle'
            />
        </div>
    );
}
