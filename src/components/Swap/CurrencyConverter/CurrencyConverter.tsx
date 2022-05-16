import { ChangeEvent } from 'react';
import styles from './CurrencyConverter.module.css';
import CurrencySelector from '../CurrencySelector/CurrencySelector';

interface CurrencyConverterProps {
    isLiq: boolean;
    poolPrice: number;
}

export default function CurrencyConverter(
    props: CurrencyConverterProps,
): React.ReactElement<CurrencyConverterProps> {
    const { isLiq, poolPrice } = props;

    // TODO: update name of functions with 'handle' verbiage
    // TODO: consolidate functions into a single function
    // TODO: refactor functions to consider which token is base

    const updateBuyQty = (evt: ChangeEvent<HTMLInputElement>) => {
        const input = parseFloat(evt.target.value);
        const output = (1 / poolPrice) * input;
        const buyQtyField = document.getElementById('buy-quantity') as HTMLInputElement;
        if (buyQtyField) {
            buyQtyField.value = isNaN(output) ? '' : output.toString();
        }
    };

    const updateSellQty = (evt: ChangeEvent<HTMLInputElement>) => {
        const input = parseFloat(evt.target.value);
        const output = poolPrice * input;
        const sellQtyField = document.getElementById('sell-quantity') as HTMLInputElement;
        if (sellQtyField) {
            sellQtyField.value = isNaN(output) ? '' : output.toString();
        }
    };

    return (
        <section className={styles.currency_converter}>
            <CurrencySelector
                direction={isLiq ? 'Select Pair' : 'From:'}
                fieldId='sell'
                sellToken
                updateOtherQuantity={updateBuyQty}
            />
            <div className={styles.arrow_container}>
                {isLiq ? null : <span className={styles.arrow} />}
            </div>
            <CurrencySelector
                direction={isLiq ? '' : 'To:'}
                fieldId='buy'
                updateOtherQuantity={updateSellQty}
            />
        </section>
    );
}
