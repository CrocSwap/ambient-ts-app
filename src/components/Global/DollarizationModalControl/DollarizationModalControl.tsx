import { Dispatch, SetStateAction, useId } from 'react';
import Toggle from '../../Form/Toggle';
import styles from './DollarizationModalControl.module.css';

interface propsIF {
    tempEnableDollarization: boolean;
    setTempEnableDollarization: Dispatch<SetStateAction<boolean>>;
    displayInSettings?: boolean;
    isMobileChartSettings?: boolean;
}

export default function DollarizationModalControl(props: propsIF) {
    const {
        tempEnableDollarization,
        setTempEnableDollarization,
        displayInSettings,
        isMobileChartSettings,
    } = props;

    const compKey = useId();

    const toggleAriaLabel = `${
        tempEnableDollarization ? 'disable' : 'enable'
    } dollarization mode`;

    return (
        <div
            className={
                isMobileChartSettings
                    ? styles.main_container_mobile_chart
                    : styles.main_container
            }
        >
            {displayInSettings ? (
                <p tabIndex={0}>{'Display prices in USD'}</p>
            ) : (
                <p tabIndex={0}>Display prices in USD</p>
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
