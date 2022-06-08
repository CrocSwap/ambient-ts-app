import styles from './CurrencyDisplayContainer.module.css';
import AmountAndCurrencyDisplay from '../AmountAndCurrencyDisplay/AmountAndCurrencyDisplay';

export default function CurrencyDisplayContainer() {
    const ethereumIcon =
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png';

    const diaIcon = 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png';

    return (
        <div className={styles.container}>
            <AmountAndCurrencyDisplay value={2343} tokenImg={ethereumIcon} />

            <AmountAndCurrencyDisplay value={126432} tokenImg={diaIcon} />
        </div>
    );
}
