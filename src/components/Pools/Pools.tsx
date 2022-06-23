import { PoolData } from '../../state/pools/reducer';
import PoolRow from './PoolRow';
import styles from './Pools.module.css';

interface PoolProps {
    propType: string;
    pools: PoolData[];
}

export default function Pools(props: PoolProps) {
    const poolsDisplay = props.pools.map((pool, idx) => (
        <PoolRow pool={pool} index={idx + 1} key={idx} />
    ));

    const poolsHeader = (
        <thead>
            <tr>
                <th>#</th>
                <th>Pool</th>
                <th></th>
                <th></th>
                <th>TVL</th>
                <th>Volume 24H</th>
                <th>Volume 7D</th>
            </tr>
        </thead>
    );

    return (
        <div className={styles.pool_table_display}>
            <table>
                {poolsHeader}

                <tbody>{poolsDisplay}</tbody>
            </table>
        </div>
    );
}
