import { PoolData } from '../../state/pools/reducer';
import { feeTierPercent, isAddress } from '../../utils';
import { formatDollarAmount } from '../../utils/numbers';
import styles from './Pool.module.css';

interface PoolProps {
    pool: PoolData;
    index: number;
}

export default function PoolRow(props: PoolProps) {
    const poolData = props.pool;

    function getTokenLogoURL(address: string) {
        const checkSummed = isAddress(address);
        return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${checkSummed}/logo.png`;
    }

    const tokenImages = (
        <>
            <td data-column='name' width={350}>
                <td>
                    <img
                        src={getTokenLogoURL(poolData.token0.address)}
                        onError={({ currentTarget }) => {
                            currentTarget.onerror = null;
                            currentTarget.src = '/question.svg';
                        }}
                        alt='token'
                        width='30px'
                    />
                    <img
                        src={getTokenLogoURL(poolData.token1.address)}
                        onError={({ currentTarget }) => {
                            currentTarget.onerror = null;
                            currentTarget.src = '/question.svg';
                        }}
                        alt='token'
                        width='30px'
                    />
                </td>
                <td>
                    <span className={styles.token_list_text}>
                        {poolData.token0.symbol}/{poolData.token1.symbol}
                    </span>
                </td>
                <td>
                    <div className={styles.in_range_display}>
                        {feeTierPercent(poolData.feeTier)}
                    </div>
                </td>
            </td>
        </>
    );

    return (
        <tr>
            <td data-column='id' className={styles.pool_id}>
                {props.index + 1}
            </td>
            {tokenImages}

            <td></td>
            <td></td>
            <td data-column='symbol'>{formatDollarAmount(poolData.tvlUSD)}</td>
            <td data-column='Range Status'>{formatDollarAmount(poolData.volumeUSD)}</td>
            <td data-column='Range Status'>{formatDollarAmount(poolData.volumeUSDWeek)}</td>
        </tr>
    );
}
