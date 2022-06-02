import {
    // ChangeEvent,
    SetStateAction,
} from 'react';
import styles from './LimitCurrencyConverter.module.css';
import LimitCurrencySelector from '../LimitCurrencySelector/LimitCurrencySelector';
import LimitRate from '../LimitRate/LimitRate';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';

interface LimitCurrencyConverterProps {
    tokenPair: {
        dataTokenA: TokenIF;
        dataTokenB: TokenIF;
    };
    poolPrice?: number;
    setIsSellTokenPrimary?: React.Dispatch<SetStateAction<boolean>>;
}

export default function LimitCurrencyConverter(props: LimitCurrencyConverterProps) {
    const { tokenPair } = props;
    console.log(tokenPair);

    return (
        <section className={styles.currency_converter}>
            <LimitCurrencySelector
                tokenData={tokenPair.dataTokenA}
                fieldId='sell'
                sellToken
                direction='Price'
            />
            <LimitCurrencySelector tokenData={tokenPair.dataTokenB} fieldId='buy' direction='To' />
            <div className={styles.arrow_container}>
                <span className={styles.arrow} />
            </div>
            <LimitRate fieldId='limit-rate' />
        </section>
    );
}
