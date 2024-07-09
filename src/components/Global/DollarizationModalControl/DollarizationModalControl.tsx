import { useId, Dispatch, SetStateAction } from 'react';
import Toggle from '../../Form/Toggle';
import styles from './DollarizationModalControl.module.css';

interface propsIF {
    tempEnableDollarization: boolean;
    setTempEnableDollarization: Dispatch<SetStateAction<boolean>>;
    displayInSettings?: boolean;
}

export default function DollarizationModalControl(props: propsIF) {
    const {
        tempEnableDollarization,
        setTempEnableDollarization,
        displayInSettings,
    } = props;

    const compKey = useId();

    const toggleAriaLabel = `${
        tempEnableDollarization ? 'disable' : 'enable'
    } dollarization mode`;

    return (
        <div className={styles.main_container}>
            {displayInSettings ? (
                <p tabIndex={0}>{'Display Prices in USD'}</p>
            ) : (
                <p tabIndex={0}>Display Prices in USD</p>
            )}
            <Toggle
                key={compKey}
                isOn={tempEnableDollarization}
                disabled={false}
                handleToggle={() =>
                    setTempEnableDollarization(!tempEnableDollarization)
                }
                id='enable_dollarization_toggle'
                aria-label={toggleAriaLabel}
            />
        </div>
    );
}
