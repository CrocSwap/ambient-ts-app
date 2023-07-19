import PoolCard from '../../Global/PoolCard/PoolCard';
import styles from './TopPools.module.css';
import { useContext } from 'react';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { Link } from 'react-router-dom';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';

interface TopPoolsPropsIF {
    noTitle?: boolean;
    gap?: string;
}
// eslint-disable-next-line
export default function TopPools(props: TopPoolsPropsIF) {
    const { topPools } = useContext(CrocEnvContext);
    const showMobileVersion = useMediaQuery('(max-width: 600px)');
    const poolData = showMobileVersion ? topPools.slice(0, 2) : topPools;

    return (
        <div className={styles.container}>
            <div className={styles.title} tabIndex={0} aria-label='Top Pools'>
                Top Pools
            </div>
            <div className={styles.content}>
                {poolData.map((pool, idx) => (
                    <PoolCard key={idx} pool={pool} />
                ))}
            </div>
            <div className={`${styles.content} ${styles.view_more}`}>
                <Link to='/explore'>View More</Link>
            </div>
        </div>
    );
}
