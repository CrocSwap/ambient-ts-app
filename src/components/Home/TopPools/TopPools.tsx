import PoolCard from '../../Global/PoolCard/PoolCard';
import styles from './TopPools.module.css';
import { useContext } from 'react';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { Link } from 'react-router-dom';

export default function TopPools() {
    const { topPools } = useContext(CrocEnvContext);

    return (
        <div className={styles.container}>
            <div className={styles.title} tabIndex={0} aria-label='Top Pools'>
                Top Pools
            </div>
            <div className={styles.content}>
                {topPools.map((pool, idx) => (
                    <PoolCard key={idx} pool={pool} />
                ))}
            </div>
            <div className={`${styles.content} ${styles.view_more}`}>
                <Link to='/explore'>View More</Link>
            </div>
        </div>
    );
}
