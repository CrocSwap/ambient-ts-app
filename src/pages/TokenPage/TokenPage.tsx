/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Divider from '../../components/Global/Divider/Divider';
import {
    usePoolsForToken,
    useTokenChartData,
    useTokenData,
    useTokenPriceData,
} from '../../state/tokens/hooks';
import TokenCardInfo from './TokenInfoCard/TokenInfoCard';
import styles from './TokenPage.module.css';
import { usePoolDatas } from '../../state/pools/hooks';
import { currentTimestamp, isAddress } from '../../utils';
import TokenPageChart from './Chart/TokenPageChart';
import { formatDollarAmount } from '../../utils/numbers';
import { ONE_HOUR_SECONDS, TimeWindow } from '../../constants/intervals';
import { PriceChartEntry } from '../../types';
import logo from '../../assets/images/logos/ambient_logo.svg';
import moment from 'moment';
import Pools from '../../components/Pools/Pools';

const DEFAULT_TIME_WINDOW = TimeWindow.WEEK;

export default function TokenPage() {
    const { address } = useParams() ?? '';
    const [timeWindow] = useState(DEFAULT_TIME_WINDOW);
    const chartData = useTokenChartData(address!);
    const tokenData = useTokenData(address);
    const priceData = useTokenPriceData(address!, ONE_HOUR_SECONDS, timeWindow);
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const formattedVolumeData = useMemo(() => {
        if (chartData) {
            return chartData.map((day) => {
                return {
                    time: new Date(moment(new Date(day.date * 1000)).format('YYYY-MM-DD')),
                    value: day.volumeUSD,
                };
            });
        } else {
            return [];
        }
    }, [chartData]);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const poolsForToken = usePoolsForToken(address!);
    const poolDatas = usePoolDatas(poolsForToken ?? []);
    // const transactions = useTokenTransactions(address!);

    const formattedTvlData = useMemo(() => {
        if (chartData) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return chartData.map((day: any) => {
                return {
                    time: new Date(day.date * 1000),
                    value: day.totalValueLockedUSD,
                };
            });
        } else {
            return [];
        }
    }, [chartData]);

    // pricing data
    const adjustedToCurrent = useMemo(() => {
        if (priceData && tokenData && priceData.length > 0) {
            const adjusted = Object.assign([], priceData);
            adjusted.push({
                time: currentTimestamp() / 1000,
                open: priceData[priceData.length - 1].close,
                close: tokenData?.priceUSD,
                high: tokenData?.priceUSD,
                low: priceData[priceData.length - 1].close,
            });
            return adjusted.map((item: PriceChartEntry) => {
                return {
                    time: new Date(item.time * 1000),
                    high: item.high,
                    low: item.low,
                    open: item.open,
                    close: item.close,
                };
            });
        } else {
            return [];
        }
    }, [priceData, tokenData]);

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

    const loading = (
        <div className={styles.animatedImg}>
            <img src={logo} width={110} alt='logo' />
        </div>
    );

    return (
        <main data-testid={'token-page'} className={styles.container}>
            {tokenInfo}
            <div className={styles.hsPAQl}>
                <TokenCardInfo token={tokenData} />
                {chartData && tokenData && priceData ? (
                    <TokenPageChart
                        tvlData={formattedTvlData}
                        priceData={adjustedToCurrent}
                        volumeData={formattedVolumeData}
                        token={tokenData}
                    />
                ) : (
                    <>{loading}</>
                )}
            </div>

            <Divider />
            <div className={styles.cqwlBw}>
                <h2>Pools</h2>
                <Pools poolType='top' pools={poolDatas} maxItems={10} />
            </div>
        </main>
    );
}
