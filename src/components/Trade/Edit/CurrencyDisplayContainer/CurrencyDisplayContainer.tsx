import styles from './CurrencyDisplayContainer.module.css';
import AmountAndCurrencyDisplay from '../AmountAndCurrencyDisplay/AmountAndCurrencyDisplay';

interface CurrencyDisplayProps {
    quoteTokenSymbol: string;
    tokenAQtyDisplay: string;
    tokenBQtyDisplay: string;
    baseTokenSymbol: string;
    baseTokenImageURL: string;
    quoteTokenImageURL: string;
    disable?: boolean;
}

export default function CurrencyDisplayContainer(props: CurrencyDisplayProps) {
    // const ethereumIcon =
    //     'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/580px-Ethereum-icon-purple.svg.png';

    // const diaIcon = 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png';

    return (
        <div className={styles.container}>
            <AmountAndCurrencyDisplay
                tokenImg={props.baseTokenImageURL}
                qty={props.tokenAQtyDisplay}
                symbol={props.baseTokenSymbol}
                fieldId={'sell'}
                disable={props.disable}
            />

            <AmountAndCurrencyDisplay
                tokenImg={props.quoteTokenImageURL}
                qty={props.tokenBQtyDisplay}
                symbol={props.quoteTokenSymbol}
                fieldId={'buy'}
                disable={props.disable}
            />
        </div>
    );
}
