import styles from './CurrencyDisplayContainer.module.css';
import AmountAndCurrencyDisplay from '../AmountAndCurrencyDisplay/AmountAndCurrencyDisplay';

interface CurrencyDisplayProps {
    quoteTokenSymbol: string;
    tokenAQtyDisplay: string;
    tokenBQtyDisplay: string;
    baseTokenSymbol: string;
    disable?: boolean;
}

export default function CurrencyDisplayContainer(props: CurrencyDisplayProps) {
    const ethereumIcon =
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png';

    const diaIcon = 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png';

    return (
        <div className={styles.container}>
            <AmountAndCurrencyDisplay
                value={2343}
                tokenImg={ethereumIcon}
                qty={props.tokenAQtyDisplay}
                symbol={props.baseTokenSymbol}
                fieldId={'sell'}
                disable={props.disable}
            />

            <AmountAndCurrencyDisplay
                value={126432}
                tokenImg={diaIcon}
                qty={props.tokenBQtyDisplay}
                symbol={props.quoteTokenSymbol}
                fieldId={'buy'}
                disable={props.disable}
            />
        </div>
    );
}
