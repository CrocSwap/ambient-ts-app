import { ChangeEvent, SetStateAction } from 'react';
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

    const handleChangeQtyTokenA = (evt: ChangeEvent<HTMLInputElement>) => {
        console.log('user changed value for Token A');
        console.log(evt.target.value);
    };

    const handleChangeQtyTokenB = (evt: ChangeEvent<HTMLInputElement>) => {
        console.log('user changed value for Token B');
        console.log(evt.target.value);
    };

    return (
        <section className={styles.currency_converter}>
            <RangeCurrencySelector
                fieldId='sell'
                updateOtherQuantity={handleChangeQtyTokenA}
                sellToken
            />
            <div className={styles.arrow_container}>
                {isLiq ? null : <span className={styles.arrow} />}
            </div>
            <RangeCurrencySelector fieldId='buy' updateOtherQuantity={handleChangeQtyTokenB} />
        </section>
    );
}
