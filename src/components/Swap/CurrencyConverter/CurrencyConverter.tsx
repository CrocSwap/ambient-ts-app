import { useState, ChangeEvent } from 'react';
import styles from './CurrencyConverter.module.css';
import CurrencySelector from '../CurrencySelector/CurrencySelector';
interface CurrencyConverterProps {
    isLiq?: boolean;
}

export default function CurrencyConverter(props: CurrencyConverterProps) {
    const { isLiq } = props;

    const [sellTokenQty, setSellTokenQty] = useState<number>(0);
    const [buyTokenQty, setBuyTokenQty] = useState<number>(0);

    const updateSellQty = (input: ChangeEvent<HTMLInputElement>) => {
        console.log('fired function updateSellQty');
        console.log(typeof input, { input });
    };

    const updateBuyQty = (input: ChangeEvent<HTMLInputElement>) => {
        console.log('fired function updateBuyQty');
        console.log(typeof input, { input });
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
