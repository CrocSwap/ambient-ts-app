import {
    // ChangeEvent,
    SetStateAction,
} from 'react';
import styles from './LimitCurrencyConverter.module.css';
import LimitCurrencySelector from '../LimitCurrencySelector/LimitCurrencySelector';
import LimitRate from '../LimitRate/LimitRate';

interface LimitCurrencyConverterProps {
    poolPrice?: number;
    setIsSellTokenPrimary?: React.Dispatch<SetStateAction<boolean>>;
}

export default function LimitCurrencyConverter(): React.ReactElement<LimitCurrencyConverterProps> {
// props: LimitCurrencyConverterProps,
    return (
        <section className={styles.currency_converter}>
            <LimitCurrencySelector fieldId='sell' sellToken direction='Price' />
            <LimitCurrencySelector fieldId='buy' direction='To' />
            <div className={styles.arrow_container}>
                <span className={styles.arrow} />
            </div>
            <LimitRate fieldId='limit-rate' />
        </section>
    );
}
