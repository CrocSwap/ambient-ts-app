import {
    // ChangeEvent,
    SetStateAction,
} from 'react';
import styles from './LimitCurrencyConverter.module.css';
import LimitCurrencySelector from '../LimitCurrencySelector/LimitCurrencySelector';

interface LimitCurrencyConverterProps {
    isLiq?: boolean;
    poolPrice?: number;
    setIsSellTokenPrimary?: React.Dispatch<SetStateAction<boolean>>;
}

export default function LimitCurrencyConverter(
    props: LimitCurrencyConverterProps,
): React.ReactElement<LimitCurrencyConverterProps> {
    const { isLiq } = props;

    return (
        <section className={styles.currency_converter}>
            <LimitCurrencySelector fieldId='sell' sellToken />
            <div className={styles.arrow_container}>
                {isLiq ? null : <span className={styles.arrow} />}
            </div>
            <LimitCurrencySelector fieldId='buy' />
        </section>
    );
}
