import { Badge } from '@material-ui/core';
import { PoolData } from '../../state/pools/reducer';
import { feeTierPercent } from '../../utils';
import { formatDollarAmount } from '../../utils/numbers';
import styles from './Pool.module.css';

interface PoolProps {
    pool: PoolData;
    index: number;
}

export default function PoolRow(props: PoolProps) {
    const poolData = props.pool;
    return (
        <tr>
            <td data-column='id' className={styles.pool_id}>
                {props.index}
            </td>
            <td data-column='name' className={styles.pool_range}>
                {poolData.token0.symbol}/{poolData.token1.symbol}
                <Badge>{feeTierPercent(poolData.feeTier)}</Badge>
            </td>
            <td></td>
            <td></td>
            <td data-column='symbol' className={styles.apy}>
                {formatDollarAmount(poolData.tvlUSD)}
            </td>
            <td data-column='Range Status'>{formatDollarAmount(poolData.volumeUSD)}</td>
            <td data-column='Range Status'>{formatDollarAmount(poolData.volumeUSDWeek)}</td>
        </tr>
    );
}
