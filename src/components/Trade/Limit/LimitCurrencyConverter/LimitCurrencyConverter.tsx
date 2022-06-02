// START: Import React and Dongles
import { SetStateAction } from 'react';

// START: Import React Functional Components
import LimitCurrencySelector from '../LimitCurrencySelector/LimitCurrencySelector';
import LimitRate from '../LimitRate/LimitRate';

// START: Import Local Files
import styles from './LimitCurrencyConverter.module.css';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';

// interface for component props
interface LimitCurrencyConverterProps {
    tokenPair: {
        dataTokenA: TokenIF;
        dataTokenB: TokenIF;
    };
    poolPrice?: number;
    setIsSellTokenPrimary?: React.Dispatch<SetStateAction<boolean>>;
}

// central react functional component
export default function LimitCurrencyConverter(props: LimitCurrencyConverterProps) {
    const { tokenPair } = props;

    // TODO: pass tokenPair to <LimitRate /> as a prop such that we can use a dynamic
    // TODO: ... logo instead of the hardcoded one it contains

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
