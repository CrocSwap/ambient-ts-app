import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import styles from './RangeCardHeader.module.css';

interface RangeCardHeaderProps {
    baseToken: TokenIF;
    quoteToken: TokenIF;
}

export default function RangeCardHeader(props: RangeCardHeaderProps) {
    const { baseToken, quoteToken } = props;

    return (
        <div className={styles.main_container}>
            <div className={styles.row_container}>
                <p>ID</p>
                <p className={styles.wallet}>Wallet</p>

                <p className={styles.range}>Range</p>
                <p className={styles.range_sing}>Range Min</p>
                <p className={styles.range_sing}>Range Max</p>
                <p className={styles.token}>{baseToken.symbol}</p>
                <p className={styles.token}>{quoteToken.symbol}</p>
                <p>APY</p>
                <p>Status</p>
            </div>

            <div></div>
        </div>
    );
}
