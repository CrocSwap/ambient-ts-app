import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Divider from '../../components/Global/Divider/Divider';
import Pools from '../../components/Pools/Pools';

import styles from './PoolPage.module.css';
import { usePoolChartData, usePoolDatas, usePoolTransactions } from '../../state/pools/hooks';
import { isAddress } from '../../utils';
import PoolInfoCard from './PoolInfoCard/PoolInfoCard';

export default function PoolPage() {
    const { address } = useParams();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const poolData = usePoolDatas([address!])[0];
    const chartData = usePoolChartData(address!);
    const transactions = usePoolTransactions(address!);

    function getPoolLogoURL(address: string) {
        const checkSummed = isAddress(address);
        return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${checkSummed}/logo.png`;
    }

    const poolInfo = (
        <div className={styles.pool_info_container}>
            <div className={styles.pools_info}>
                <div className={styles.pools_images}>
                    <img
                        className={styles.pool_list}
                        src={getPoolLogoURL(poolData.token0.address)}
                        onError={({ currentTarget }) => {
                            currentTarget.onerror = null;
                            currentTarget.src = '/question.svg';
                        }}
                        alt='pool'
                        width='30px'
                    />
                </div>
                <div className={styles.pools_images}>
                    <img
                        className={styles.pool_list}
                        src={getPoolLogoURL(poolData.token1.address)}
                        onError={({ currentTarget }) => {
                            currentTarget.onerror = null;
                            currentTarget.src = '/question.svg';
                        }}
                        alt='pool'
                        width='30px'
                    />
                </div>
                <span className={styles.pools_name}>
                    {' '}
                    {poolData.token0.symbol}/{poolData.token1.symbol}
                </span>
            </div>
        </div>
    );

    return (
        <main data-testid={'pool-page'} className={styles.pools_container}>
            {poolInfo}
            <PoolInfoCard pool={poolData} />
            <Divider />
            {/* <Transactions transactions={transactions!} /> */}
        </main>
    );
}
