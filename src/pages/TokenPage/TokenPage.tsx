/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Divider from '../../components/Global/Divider/Divider';
import Pools from '../../components/Pools/Pools';

import { usePoolsForToken, useTokenChartData, useTokenData } from '../../state/tokens/hooks';

import TokenCardInfo from './TokenInfoCard/TokenInfoCard';
import styles from './TokenPage.module.css';
import { usePoolDatas } from '../../state/pools/hooks';
import { isAddress } from '../../utils';
import TokenPageChart from './Chart/TokenPageChart';
import { formatDollarAmount } from '../../utils/numbers';
import { unixToDate } from '../../utils/date';

export default function TokenPage() {
    const { address } = useParams() ?? '';
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const tokenData = useTokenData(address);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const poolsForToken = usePoolsForToken(address!);
    const poolDatas = usePoolDatas(poolsForToken ?? []);
    // const transactions = useTokenTransactions(address!);
    const chartData = useTokenChartData(address!);

    const formattedTvlData = useMemo(() => {
        if (chartData) {
            return chartData.map((day) => {
                return {
                    time: unixToDate(day.date),
                    value: day.totalValueLockedUSD,
                };
            });
        } else {
            return [];
        }
    }, [chartData]);
    function getTokenLogoURL() {
        const checkSummed = isAddress(tokenData?.address);
        return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${checkSummed}/logo.png`;
    }

    const tokenInfo = (
        <div className={styles.hsPAQl}>
            <div className={styles.token_info_container}>
                <div className={styles.tokens_info}>
                    <img
                        className={styles.token_image}
                        src={getTokenLogoURL()}
                        onError={({ currentTarget }) => {
                            currentTarget.onerror = null;
                            currentTarget.src = '/question.svg';
                        }}
                        alt='token'
                        width='30px'
                    />
                    <span className={styles.token_name}>{tokenData?.name}</span>
                    <span className={styles.token_symbol}>({tokenData?.symbol})</span>
                </div>
                <div className={styles.token_price_info}>
                    <label className={styles.token_price}>
                        {formatDollarAmount(tokenData?.priceUSD)}
                    </label>
                    ({' '}
                    {tokenData ? (
                        <label
                            className={
                                tokenData.priceUSDChange > 0
                                    ? styles.token_priceChange
                                    : styles.low_token_priceChange
                            }
                        >
                            {Math.abs(tokenData.priceUSDChange).toFixed(2)}%
                        </label>
                    ) : (
                        <></>
                    )}
                    )
                </div>
            </div>
        </div>
    );

    return (
        <main data-testid={'token-page'} className={styles.container}>
            {tokenInfo}
            <div className={styles.hsPAQl}>
                <TokenCardInfo token={tokenData} />
                <TokenPageChart chartData={formattedTvlData} token={tokenData} />
            </div>

            <Divider />
            <h2>Pools</h2>

            <Pools pools={poolDatas} propType='all' maxItems={10} />
            {/* <Transactions transactions={transactions!} /> */}
        </main>
    );
}
