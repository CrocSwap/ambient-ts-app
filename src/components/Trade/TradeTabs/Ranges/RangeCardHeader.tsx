import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import styles from './RangeCardHeader.module.css';
import { FaSort } from 'react-icons/fa';

interface RangeCardHeaderProps {
    baseToken: TokenIF;
    quoteToken: TokenIF;
}

export default function RangeCardHeader(props: RangeCardHeaderProps) {
    const {
        baseToken,
        quoteToken
    } = props;

    return (
        <div className={styles.main_container}>
            <div className={styles.row_container}>
                <p className={styles.wallet}>
                    <FaSort />
                    Wallet
                </p>
                <p className={styles.range}>
                    <FaSort />
                    Range
                </p>
                <p className={styles.range_sing}>
                    <FaSort />
                    Range Min
                </p>
                <p className={styles.range_sing}>
                    <FaSort />
                    Range Max
                </p>
                <p className={styles.token}>
                    <FaSort />
                    {baseToken.symbol}
                </p>
                <p className={styles.token}>
                    <FaSort />
                    {quoteToken.symbol}
                </p>
                <p>
                    <FaSort />
                    APY
                </p>
                <p>
                    <FaSort />
                    Status
                </p>
            </div>

            <div></div>
        </div>
    );
}
