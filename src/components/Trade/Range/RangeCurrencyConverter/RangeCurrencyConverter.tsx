import {
    // ChangeEvent,
    SetStateAction,
} from 'react';
import styles from './RangeCurrencyConverter.module.css';
import RangeCurrencySelector from '../RangeCurrencySelector/RangeCurrencySelector';

interface RangeCurrencyConverterProps {
    isLiq?: boolean;
    poolPrice?: number;
    setIsSellTokenPrimary?: React.Dispatch<SetStateAction<boolean>>;
}

export default function RangeCurrencyConverter(
    props: RangeCurrencyConverterProps,
): React.ReactElement<RangeCurrencyConverterProps> {
    const { isLiq } = props;

    return (
        <section className={styles.currency_converter}>
            <RangeCurrencySelector fieldId='sell' sellToken />
            <div className={styles.arrow_container}>
                {isLiq ? null : <span className={styles.arrow} />}
            </div>
            <RangeCurrencySelector fieldId='buy' />
        </section>
    );
}
