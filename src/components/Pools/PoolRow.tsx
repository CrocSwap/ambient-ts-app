import { useNavigate } from 'react-router-dom';
import { PoolData } from '../../state/pools/models';
import { feeTierPercent, isAddress } from '../../utils';
import { formatDollarAmount } from '../../utils/numbers';
import PoolDisplay from '../Global/Analytics/PoolDisplay';
import TokenDisplay from '../Global/Analytics/TokenDisplay';
import TradeButton from '../Global/Analytics/TradeButton';
import Apy from '../Global/Tabs/Apy/Apy';
import styles from './PoolRow.module.css';

interface PoolProps {
    pool: PoolData;
    index: number;
    poolType: string;
}

export default function PoolRow(props: PoolProps) {
    const poolData = props.pool;

    const navigate = useNavigate();

    function handleRowClick() {
        navigate('/pools/' + poolData.address);
    }

    return (
        <div className={styles.main_container} onClick={handleRowClick}>
            <div className={styles.tokens_container}>
                <TokenDisplay
                    token0={isAddress(poolData.token0.address)}
                    token1={isAddress(poolData.token1.address)}
                />
            </div>

            <div className={styles.row_container}>
                <PoolDisplay token0={poolData.token0.symbol} token1={poolData.token1.symbol} />
                <>
                    <section className={styles.display}>
                        {formatDollarAmount(poolData.tvlUSD)}
                    </section>
                </>

                <>
                    <section className={styles.display}>
                        {formatDollarAmount(poolData.volumeUSD)}
                    </section>
                </>

                <>
                    <section className={styles.display}>
                        {formatDollarAmount(poolData.volumeUSDWeek)}
                    </section>
                </>

                <>
                    <section
                        className={props.poolType === 'trend' ? styles.feeTierHide : styles.display}
                    >
                        {feeTierPercent(poolData.feeTier)}
                    </section>
                </>

                <Apy amount={50} />
            </div>

            <div className={styles.menu_container}>
                <TradeButton />
            </div>
        </div>
    );
}
