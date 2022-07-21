import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Divider from '../../components/Global/Divider/Divider';

import styles from './PoolPage.module.css';
import { usePoolChartData, usePoolDatas } from '../../state/pools/hooks';
import { feeTierPercent, isAddress } from '../../utils';
import PoolInfoCard from './PoolInfoCard/PoolInfoCard';
import { formatAmount } from '../../utils/numbers';
import PoolPageChart from './Chart/PoolPageChart';
import { unixToDate } from '../../utils/date';

export default function PoolPage() {
    const { address } = useParams();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const poolData = usePoolDatas([address!])[0];
    const chartData = usePoolChartData(address!);
    // const transactions = usePoolTransactions(address);

    const formattedTvlData = useMemo(() => {
        if (chartData) {
            return chartData.map((day) => {
                return {
                    time: new Date(day.date * 1000),
                    value: day.totalValueLockedUSD,
                };
            });
        } else {
            return [];
        }
    }, [chartData]);

    const formattedVolumeData = useMemo(() => {
        if (chartData) {
            return chartData.map((day) => {
                return {
                    time: new Date(day.date * 1000),
                    value: day.volumeUSD,
                };
            });
        } else {
            return [];
        }
    }, [chartData]);

    const formattedFeesUSD = useMemo(() => {
        if (chartData) {
            return chartData.map((day) => {
                return {
                    time: new Date(day.date * 1000),
                    value: day.feesUSD,
                };
            });
        } else {
            return [];
        }
    }, [chartData]);

    function getPoolLogoURL(address: string) {
        const checkSummed = isAddress(address);
        return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${checkSummed}/logo.png`;
    }

    const poolInfo = (
        <div className={styles.hsPAQl}>
            <div className={styles.cGsJEc}>
                <div className={styles.eJnjNO}>
                    <div className={styles.tokens_info}>
                        <img
                            className={styles.token_image}
                            src={getPoolLogoURL(poolData.token0.address)}
                            onError={({ currentTarget }) => {
                                currentTarget.onerror = null;
                                currentTarget.src = '/question.svg';
                            }}
                            alt='pool'
                            width='30px'
                        />
                    </div>
                    <div className={styles.tokens_info}>
                        <img
                            className={styles.token_image}
                            src={getPoolLogoURL(poolData.token1.address)}
                            onError={({ currentTarget }) => {
                                currentTarget.onerror = null;
                                currentTarget.src = '/question.svg';
                            }}
                            alt='pool'
                            width='30px'
                        />
                    </div>
                    <span className={styles.token_name}>
                        {poolData.token0.symbol}/{poolData.token1.symbol}
                    </span>
                    <span className={styles.hHQgLw}>${feeTierPercent(poolData.feeTier)}</span>
                </div>
                <div className={styles.ccPGLM}>
                    <div className={styles.jMUUPo}>
                        <img
                            className={styles.pool_image}
                            src={getPoolLogoURL(poolData.token0.address)}
                            onError={({ currentTarget }) => {
                                currentTarget.onerror = null;
                                currentTarget.src = '/question.svg';
                            }}
                            alt='pool'
                            width='30px'
                        />
                        <label className={styles.pool_info}>
                            {`1 ${poolData.token0.symbol} =  ${formatAmount(
                                poolData.token1Price,
                                4,
                            )} ${poolData.token1.symbol}`}
                        </label>
                    </div>
                    <div className={styles.cGkprt}>
                        <img
                            className={styles.pool_image}
                            src={getPoolLogoURL(poolData.token1.address)}
                            onError={({ currentTarget }) => {
                                currentTarget.onerror = null;
                                currentTarget.src = '/question.svg';
                            }}
                            alt='pool'
                            width='30px'
                        />
                        <label className={styles.pool_info}>
                            {`1 ${poolData.token1.symbol} =  ${formatAmount(
                                poolData.token0Price,
                                4,
                            )} ${poolData.token0.symbol}`}
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <main data-testid={'pool-page'} className={styles.container}>
            {poolInfo}
            <div className={styles.hsPAQl}>
                <PoolInfoCard pool={poolData} />
                <PoolPageChart
                    tvlData={formattedTvlData}
                    feesData={formattedFeesUSD}
                    volumeData={formattedVolumeData}
                    pool={poolData}
                />
            </div>
            <Divider />
            {/* <Transactions transactions={transactions!} /> */}
        </main>
    );
}
