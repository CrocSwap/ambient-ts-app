import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Divider from '../../components/Global/Divider/Divider';

import styles from './PoolPage.module.css';
import { usePoolChartData, usePoolDatas, usePoolTransactions } from '../../state/pools/hooks';
import { isAddress } from '../../utils';
import PoolInfoCard from './PoolInfoCard/PoolInfoCard';
import { formatAmount } from '../../utils/numbers';
import PoolPageChart from './Chart/PoolPageChart';

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
                    {poolData.token0.symbol}/{poolData.token1.symbol}
                </span>

                <div>
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
                    {`1 ${poolData.token0.symbol} =  ${formatAmount(poolData.token1Price, 4)} ${
                        poolData.token1.symbol
                    }`}
                </div>

                <div>
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
                    {`1 ${poolData.token1.symbol} =  ${formatAmount(poolData.token0Price, 4)} ${
                        poolData.token0.symbol
                    }`}
                </div>
            </div>
        </div>
    );

    return (
        <main data-testid={'pool-page'} className={styles.container}>
            {poolInfo}
            <div className={styles.hsPAQl}>
                <PoolInfoCard pool={poolData} />
                <PoolPageChart />
            </div>
            <Divider />
            {/* <Transactions transactions={transactions!} /> */}
        </main>
    );
}
