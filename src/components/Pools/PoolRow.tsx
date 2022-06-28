import { Badge } from '@material-ui/core';
import { PoolData } from '../../state/pools/models';
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
            <td data-column='tokens' className={styles.tokens}>
                <img
                    src={getTokenLogoURL(poolData.token0.address)}
                    onError={({ currentTarget }) => {
                        currentTarget.onerror = null;
                        currentTarget.src = '/static/media/ambient_logo.55c57a31.svg';
                    }}
                    alt='token'
                    width='30px'
                />
                <img
                    src={getTokenLogoURL(poolData.token1.address)}
                    onError={({ currentTarget }) => {
                        currentTarget.onerror = null;
                        currentTarget.src = '/static/media/ambient_logo.55c57a31.svg';
                    }}
                    alt='token'
                    width='30px'
                />
                {poolData.token0.symbol}/{poolData.token1.symbol}
            </td>
        </>
    );

    return (
        <tr>
            <td data-column='id' className={styles.pool_id}>
                {props.index}
            </td>
            <td data-column='name' className={styles.pool_range}>
                {tokenImages}
                <Badge>{feeTierPercent(poolData.feeTier)}</Badge>
            </td>
            <td></td>
            <td></td>
            <td data-column='symbol'>{formatDollarAmount(poolData.tvlUSD)}</td>
            <td data-column='Range Status'>{formatDollarAmount(poolData.volumeUSD)}</td>
            <td data-column='Range Status'>{formatDollarAmount(poolData.volumeUSDWeek)}</td>
        </tr>
    );
}
