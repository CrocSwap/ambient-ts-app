import styles from './GraphContainer.module.css';
import { useProtocolChartData, useProtocolData } from '../../../state/protocol/hooks';
import { useEffect, useMemo, useState } from 'react';
import { formatDollarAmount } from '../../../utils/numbers';
import AreaChart from '../../Global/Charts/AreaChart';
import BarChart from '../../Global/Charts/BarChart';
import { useTransformedVolumeData } from '../../../hooks/chart';
import logo from '../../../assets/images/logos/ambient_logo.svg';
import moment from 'moment';
import { ChartDataTimeframe } from '../../../hooks/ChartDataTimeframe';

export enum VolumeWindow {
    daily,
    weekly,
    monthly,
}

export default function GraphContainer() {
    const [protocolData] = useProtocolData();
    const [volumeHover, setVolumeHover] = useState<number | undefined>();
    const [liquidityHover, setLiquidityHover] = useState<number | undefined>();
    const [chartData] = useProtocolChartData();
    const [latestValueTvl, setLatestValueTvl] = useState<number | undefined>();
    const [latestValueVolume, setLatestValueVolume] = useState<number | undefined>();

    const [valueLabelTvl, setValueLabelTvl] = useState<string | undefined>();
    const [valueLabelVolume, setValueLabelVolume] = useState<string | undefined>();
    // const weeklyVolumeData = useTransformedVolumeData(chartData, 'week');
    // const monthlyVolumeData = useTransformedVolumeData(chartData, 'month');
    const oneDayVolumeData = useTransformedVolumeData(
        chartData?.filter(
            (item) =>
                moment(item.date * 1000).format('YYYY-MM-DD') ===
                moment(new Date()).format('YYYY-MM-DD'),
        ),
        ChartDataTimeframe.oneDay,
    );
    // const monthlyVolumeData = useTransformedVolumeData(chartData, ChartDataTimeframe.oneDay);
    const oneMonthVolumeData = useTransformedVolumeData(
        chartData?.filter(
            (item) =>
                moment(new Date()).subtract(1, 'M').format('YYYY-MM-DD') <=
                    moment(item.date * 1000).format('YYYY-MM-DD') ||
                moment(new Date()).format('YYYY-MM-DD') <=
                    moment(item.date * 1000).format('YYYY-MM-DD'),
        ),
        ChartDataTimeframe.oneMonth,
    );

    const sixMonthVolumeData = useTransformedVolumeData(
        chartData?.filter(
            (item) =>
                moment(new Date()).subtract(6, 'M').format('YYYY-MM-DD') <=
                    moment(item.date * 1000).format('YYYY-MM-DD') ||
                moment(new Date()).format('YYYY-MM-DD') <=
                    moment(item.date * 1000).format('YYYY-MM-DD'),
        ),
        ChartDataTimeframe.sixMonth,
    );

    const oneYearVolumeData = useTransformedVolumeData(
        chartData?.filter(
            (item) =>
                moment(new Date()).subtract(12, 'M').format('YYYY-MM-DD') <=
                    moment(item.date * 1000).format('YYYY-MM-DD') ||
                moment(new Date()).format('YYYY-MM-DD') <=
                    moment(item.date * 1000).format('YYYY-MM-DD'),
        ),
        ChartDataTimeframe.oneYear,
    );

    const [volumeWindow, setVolumeWindow] = useState(ChartDataTimeframe.all);
    useEffect(() => {
        if (volumeHover === undefined && protocolData) {
            setVolumeHover(protocolData.volumeUSD);
        }
    }, [protocolData, volumeHover]);

    useEffect(() => {
        if (liquidityHover === undefined && protocolData) {
            setLiquidityHover(protocolData.tvlUSD);
        }
    }, [liquidityHover, protocolData]);

    const formattedTvlData = useMemo(() => {
        if (chartData) {
            return chartData.map((day) => {
                return {
                    time: new Date(day.date * 1000),
                    value: day.tvlUSD,
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
                    time: new Date(moment(new Date(day.date * 1000)).format('YYYY-MM-DD')),
                    value: day.volumeUSD,
                };
            });
        } else {
            return [];
        }
    }, [chartData]);

    // {
    //     "date": 1659398400,
    //     "volumeUSD": 557660858.2540138,
    //     "tvlUSD": 4595037017.492477
    // }
    // {
    //     "date": 1659312000,
    //     "volumeUSD": 1118240108.4692507,
    //     "tvlUSD": 4631055024.65114
    // }

    // {
    //     "date": 1659225600,
    //     "volumeUSD": 814782234.1296902,
    //     "tvlUSD": 4662406385.048436
    // }

    // {
    //     "date": 1659139200,
    //     "volumeUSD": 937311550.5366873,
    //     "tvlUSD": 4675772043.9153805
    // }
    const formattedVolumeDataOneMonth = useMemo(() => {
        if (oneMonthVolumeData) {
            return oneMonthVolumeData.map((day) => {
                return {
                    time: new Date(moment(day.time).format('YYYY-MM-DD')),
                    value: day.value,
                };
            });
        } else {
            return [];
        }
    }, [chartData]);

    const formattedVolumeDataSixMonth = useMemo(() => {
        if (sixMonthVolumeData) {
            return sixMonthVolumeData.map((day) => {
                return {
                    time: new Date(moment(day.time).format('YYYY-MM-DD')),
                    value: day.value,
                };
            });
        } else {
            return [];
        }
    }, [chartData]);

    const formattedVolumeDataOneYear = useMemo(() => {
        if (oneYearVolumeData) {
            return oneYearVolumeData.map((day) => {
                return {
                    time: new Date(moment(day.time).format('YYYY-MM-DD')),
                    value: day.value,
                };
            });
        } else {
            return [];
        }
    }, [chartData]);

    // const formattedVolumeDataWeek = useMemo(() => {
    //     if (weeklyVolumeData) {
    //         return weeklyVolumeData.map((day) => {
    //             return {
    //                 time: new Date(moment(day.time).format('YYYY-MM-DD')),
    //                 value: day.value,
    //             };
    //         });
    //     } else {
    //         return [];
    //     }
    // }, [chartData]);

    // const formattedVolumeDataMonth = useMemo(() => {
    //     if (monthlyVolumeData) {
    //         return monthlyVolumeData.map((day) => {
    //             return {
    //                 time: new Date(moment(day.time).format('YYYY-MM-DD')),
    //                 value: day.value,
    //             };
    //         });
    //     } else {
    //         return [];
    //     }
    // }, [chartData]);

    const formattedVolumeDataOneDay = useMemo(() => {
        if (oneDayVolumeData) {
            return oneDayVolumeData.map((day) => {
                return {
                    time: new Date(moment(day.time).format('YYYY-MM-DD')),
                    value: day.value,
                };
            });
        } else {
            return [];
        }
    }, [chartData]);

    const timeFrame = (
        <div className={styles.time_frame_container}>
            <div className={styles.title}>Ambient Analytics</div>
            <div className={styles.right_side}>
                <span>Timeframe</span>
                <button
                    style={{
                        backgroundColor: volumeWindow === ChartDataTimeframe.all ? '#7371FC' : '',
                        cursor: 'pointer',
                    }}
                    onClick={() => setVolumeWindow(ChartDataTimeframe.oneDay)}
                >
                    1d
                </button>
                <button onClick={() => setVolumeWindow(ChartDataTimeframe.oneMonth)}>1M</button>
                <button onClick={() => setVolumeWindow(ChartDataTimeframe.sixMonth)}>6M </button>
                <button onClick={() => setVolumeWindow(ChartDataTimeframe.oneYear)}>1Y</button>
                <button onClick={() => setVolumeWindow(ChartDataTimeframe.all)}>All</button>
            </div>
        </div>
    );

    const dateFrame = (
        <div className={styles.time_frame_container}>
            <div className={styles.title}>Volume 24H</div>
            {/* <div className={styles.right_side}>
                <span>Timeframe</span>
                <button
                    style={{
                        backgroundColor: volumeWindow === VolumeWindow.daily ? '#7371FC' : '',
                        cursor: 'pointer',
                    }}
                    onClick={() => setVolumeWindow(VolumeWindow.daily)}
                >
                    Daily
                </button>
                <button
                    style={{
                        backgroundColor: volumeWindow === VolumeWindow.weekly ? '#7371FC' : '',
                        cursor: 'pointer',
                    }}
                    // onClick={() => setVolumeWindow(VolumeWindow.weekly)}
                >
                    Weekly
                </button>
                <button
                    style={{
                        backgroundColor: volumeWindow === VolumeWindow.monthly ? '#7371FC' : '',
                        cursor: 'pointer',
                    }}
                    // onClick={() => setVolumeWindow(VolumeWindow.monthly)}
                >
                    Monthly
                </button>
            </div> */}
        </div>
    );

    const loading = (
        <div className={styles.animatedImg}>
            <img src={logo} width={110} alt='logo' />
        </div>
    );

    const graphData = (
        <div className={styles.graph_data}>
            <div className={styles.graph_container}>
                <div className={styles.title}>Total TV</div>

                <label className={styles.v4m1wv}>
                    {latestValueTvl
                        ? formatDollarAmount(latestValueTvl, 2)
                        : formatDollarAmount(latestValueTvl, 2)}
                </label>
                <br></br>
                <label className={styles.eJnjNO}>
                    {valueLabelTvl ? valueLabelTvl + ' (UTC) ' : '-'}
                </label>
                <div className={styles.chart_container}>
                    {' '}
                    {chartData ? (
                        <AreaChart
                            data={formattedTvlData}
                            value={latestValueTvl}
                            label={valueLabelTvl}
                            setValue={setLatestValueTvl}
                            setLabel={setValueLabelTvl}
                        />
                    ) : (
                        <>{loading}</>
                    )}
                </div>
            </div>
            <div className={styles.graph_container}>
                {dateFrame}
                <label className={styles.eJnjNO}>
                    {latestValueVolume
                        ? formatDollarAmount(latestValueVolume, 2)
                        : formatDollarAmount(latestValueVolume, 2)}
                </label>
                <br></br>
                <label className={styles.eJnjNO}>
                    {valueLabelVolume ? valueLabelVolume + ' (UTC) ' : '-'}
                </label>
                <div className={styles.chart_container}>
                    {chartData ? (
                        <BarChart
                            data={
                                volumeWindow === ChartDataTimeframe.oneMonth
                                    ? formattedVolumeDataOneMonth
                                    : ChartDataTimeframe.sixMonth
                                    ? formattedVolumeDataSixMonth
                                    : ChartDataTimeframe.oneYear
                                    ? formattedVolumeDataOneYear
                                    : ChartDataTimeframe.oneDay
                                    ? formattedVolumeDataOneDay
                                    : formattedVolumeData
                                // volumeWindow === ChartDataTimeframe.monthly
                                //     ? formattedVolumeDataMonth
                                //     : volumeWindow === ChartDataTimeframe.weekly
                                //     ? formattedVolumeDataWeek
                                //     : formattedVolumeData
                            }
                            value={latestValueVolume}
                            label={valueLabelVolume}
                            setValue={setLatestValueVolume}
                            setLabel={setValueLabelVolume}
                            snapType={
                                volumeWindow === ChartDataTimeframe.oneDay
                                    ? 'days'
                                    : volumeWindow === ChartDataTimeframe.oneMonth
                                    ? 'months'
                                    : 'weeks'
                            }
                        />
                    ) : (
                        <>{loading}</>
                    )}
                </div>
            </div>
        </div>
    );

    const analyticsInfo = (
        <div className={styles.info_container}>
            <div className={styles.info_content}>
                <div className={styles.info_title}>Total TVL</div>
                <div className={styles.info_value}>
                    {formatDollarAmount(liquidityHover, 2, true)}{' '}
                </div>
            </div>

            <div className={styles.info_content}>
                <div className={styles.info_title}>24h Volume</div>
                <div className={styles.info_value}>{formatDollarAmount(volumeHover, 2)}</div>
            </div>

            <div className={styles.info_content}>
                <div className={styles.info_title}>24h Fees</div>
                <div className={styles.info_value}>{formatDollarAmount(protocolData?.feesUSD)}</div>
            </div>
        </div>
    );
    return (
        <div className={styles.GraphContainers}>
            {timeFrame}
            {graphData}
            {analyticsInfo}
        </div>
    );
}
