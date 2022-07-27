import styles from './GraphContainer.module.css';
import { useProtocolChartData, useProtocolData } from '../../../state/protocol/hooks';
import { useEffect, useMemo, useState } from 'react';
import { formatDollarAmount } from '../../../utils/numbers';
import AreaChart from '../../Global/Charts/AreaChart';
import BarChart from '../../Global/Charts/BarChart';
import { useTransformedVolumeData } from '../../../hooks/chart';
import logo from '../../../assets/images/logos/ambient_logo.svg';

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
    const weeklyVolumeData = useTransformedVolumeData(chartData, 'week');
    const monthlyVolumeData = useTransformedVolumeData(chartData, 'month');
    const [volumeWindow, setVolumeWindow] = useState(VolumeWindow.daily);
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
                    time: new Date(day.date * 1000),
                    value: day.volumeUSD,
                };
            });
        } else {
            return [];
        }
    }, [chartData]);

    const timeFrame = (
        <div className={styles.time_frame_container}>
            <div className={styles.title}>Ambient Analytics</div>
            {/* <div className={styles.right_side}>
                <span>Timeframe</span>
                <button>1m</button>
                <button>5m</button>
                <button>15m</button>
                <button>1h</button>
                <button>4h</button>
                <button>1d</button>
            </div> */}
        </div>
    );

    const dateFrame = (
        <div className={styles.time_frame_container}>
            <div className={styles.title}>Volume 24H</div>
            <div className={styles.right_side}>
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
            </div>
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
                                volumeWindow === VolumeWindow.monthly
                                    ? monthlyVolumeData
                                    : volumeWindow === VolumeWindow.weekly
                                    ? weeklyVolumeData
                                    : formattedVolumeData
                            }
                            value={latestValueVolume}
                            label={valueLabelVolume}
                            setValue={setLatestValueVolume}
                            setLabel={setValueLabelVolume}
                            snapType={
                                volumeWindow === VolumeWindow.daily
                                    ? 'days'
                                    : volumeWindow === VolumeWindow.monthly
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
