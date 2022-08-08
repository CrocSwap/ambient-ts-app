import { useNavigate } from 'react-router-dom';
import { TokenData } from '../../state/tokens/models';
import { isAddress } from '../../utils';
import { formatDollarAmount } from '../../utils/numbers';
import TokenDisplay from '../Global/Analytics/TokenDisplay';
import TradeButton from '../Global/Analytics/TradeButton';
import OpenOrderStatus from '../Global/OpenOrderStatus/OpenOrderStatus';
import styles from './TopToken.module.css';

interface TokenProps {
    token: TokenData;
    index: number;
}

export default function TopTokenRow(props: TokenProps) {
    const tokenData: TokenData = props.token;
    const navigate = useNavigate();

    function handleRowClick() {
        navigate('/tokens/' + tokenData.address);
    }

    return (
        <div className={styles.main_container} onClick={handleRowClick}>
            <div className={styles.tokens_container}>
                <TokenDisplay token0={isAddress(tokenData.address)} />
            </div>

            <div className={styles.row_container}>
                <>
                    <section className={styles.display}>
                        {' '}
                        {tokenData.name} ({tokenData.symbol})
                    </section>
                </>

                <>
                    <section className={styles.display}>
                        {formatDollarAmount(tokenData.priceUSD)}
                    </section>
                </>

                <>
                    <section className={styles.display}>
                        {formatDollarAmount(tokenData.tvlUSD)}
                    </section>
                </>

                <>
                    <section className={styles.display}>
                        {formatDollarAmount(tokenData.volumeUSD)}
                    </section>
                </>

                <>
                    <section className={styles.display}>
                        {' '}
                        {Math.abs(tokenData.priceUSDChange).toFixed(2)}%
                    </section>
                </>

                <div className={styles.status}>
                    <OpenOrderStatus isFilled />
                </div>
            </div>

            <div className={styles.menu_container}>
                <TradeButton />
            </div>
        </div>
    );

    // return (
    //     <tr onClick={handleRowClick} style={{ cursor: 'pointer' }}>
    //         <td className={styles.topToken_id}>{props.index}</td>
    //         {tokenImages}

    //         <td data-column='APY' className={styles.topToken_range}>
    //             {formatDollarAmount(tokenData.priceUSD)}
    //         </td>
    //         <td
    //             data-column='Range Status'
    //             className={tokenData.priceUSDChange < 0 ? styles.lowPriceChange : styles.apy}
    //         >
    //             {Math.abs(tokenData.priceUSDChange).toFixed(2)}%
    //         </td>
    //         <td data-column='Range Status'>{formatDollarAmount(tokenData.volumeUSD)}</td>
    //         <td data-column='Range Status'>{formatDollarAmount(tokenData.tvlUSD)}</td>
    //     </tr>
    // );
}
