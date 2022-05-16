import { useState, ChangeEvent } from 'react';
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

    const [sellTokenQty, setSellTokenQty] = useState<number>(0);
    const [buyTokenQty, setBuyTokenQty] = useState<number>(8);

    const updateBuyQty = (evt: ChangeEvent<HTMLInputElement>) => {
        const input = parseFloat(evt.target.value);
        const output = ((1 / poolPrice) * input).toString();
        const buyQtyField = document.getElementById('buy-quantity') as HTMLInputElement;
        if (buyQtyField) buyQtyField.value = output;
    };

    const updateSellQty = (evt: ChangeEvent<HTMLInputElement>) => {
        const input = parseFloat(evt.target.value);
        const output = (poolPrice * input).toString();
        const sellQtyField = document.getElementById('sell-quantity') as HTMLInputElement;
        if (sellQtyField) sellQtyField.value = output;
    };

    return (
        <section className={styles.currency_converter}>
            <CurrencySelector
                direction={isLiq ? 'Select Pair' : 'From:'}
                fieldId='sell'
                sellToken
                buyTokenQty={buyTokenQty}
                sellTokenQty={sellTokenQty}
                updateTokenQuantity={setSellTokenQty}
                updateOtherQuantity={updateBuyQty}
            />
            <div className={styles.arrow_container}>
                {isLiq ? null : <span className={styles.arrow} />}
            </div>
            <CurrencySelector
                direction={isLiq ? '' : 'To:'}
                fieldId='buy'
                buyTokenQty={buyTokenQty}
                sellTokenQty={sellTokenQty}
                updateTokenQuantity={setBuyTokenQty}
                updateOtherQuantity={updateSellQty}
            />
        </section>
    );
}
