import styles from './CurrencyConverter.module.css';
import CurrencySelector from '../CurrencySelector/CurrencySelector';

interface CurrencyConverterProps {
    isLiq: boolean;
}

export default function CurrencyConverter(
    props: CurrencyConverterProps,
): React.ReactElement<CurrencyConverterProps> {
    const { isLiq } = props;

    return (
        <section className={styles.currency_converter}>
            {
                <CurrencySelector
                    direction={isLiq ? 'Select Pair' : 'From:'}
                    fieldId='sell'
                    sellToken
                />
            }
            <div className={styles.arrow_container}>
                {isLiq ? null : <span className={styles.arrow} />}
            </div>
            <CurrencySelector direction={isLiq ? '' : 'To:'} fieldId='buy' />
        </section>
    );
}
