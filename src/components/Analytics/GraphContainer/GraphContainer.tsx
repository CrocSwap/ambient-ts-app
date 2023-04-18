// import styles from './GraphContainer.module.css';
// import { useEffect, useMemo, useState } from 'react';
// import {
//     formatAmount,
//     //  formatDollarAmount
// } from '../../../utils/numbers';
// import AreaChart from '../../Global/Charts/AreaChart';
// import BarChart from '../../Global/Charts/BarChart';
// import logo from '../../../assets/images/logos/ambient_logo.svg';
// // import { getChainStatsFresh } from '../../../utils/functions/getChainStats';
// import {
//     // getDexTvlSeries,
//     // getDexVolumeSeries,
//     // ITvlSeriesData,
//     // IVolumeSeriesData,
//     seriesDatum,
// } from '../../../utils/functions/getDexSeriesData';
// import { motion } from 'framer-motion';
// import { IS_LOCAL_ENV } from '../../../constants';

// const spring = {
//     type: 'spring',
//     stiffness: 500,
//     damping: 30,
// };

// export enum ChartDataTimeframe {
//     oneDay = '1',
//     oneMonth = '30',
//     sixMonth = '180',
//     oneYear = '365',
//     all = '60',
// }

// export default function GraphContainer() {
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const [protocolData]: any = [];
//     const [volumeHover, setVolumeHover] = useState<number | undefined>();
//     const [liquidityHover, setLiquidityHover] = useState<number | undefined>();

//     const [valueTvl, setValueTvl] = useState<number | undefined>();

//     const [valueVolume, setValueVolume] = useState<number | undefined>();

//     const [valueTvlDate, setValueTvlDate] = useState<string | undefined>();

//     const [valueVolumeDate, setValueVolumeDate] = useState<
//         string | undefined
//     >();

//     // const [totalTvlString, setTotalTvlString] = useState<string | undefined>();
//     // const [totalVolumeString, setTotalVolumeString] = useState<
//     //     string | undefined
//     // >();
//     // const [totalFeesString, setTotalFeesString] = useState<
//     //     string | undefined
//     // >();

//     // // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     // const [tvlSeriesData, setTvlSeriesData] = useState<
//     //     ITvlSeriesData | undefined
//     // >();
//     // // const [tvlSeriesData, setTvlSeriesData] = useState<tvlSeriesData | undefined>();
//     // // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     // const [volumeSeriesData, setVolumeSeriesData] = useState<
//     //     IVolumeSeriesData | undefined
//     // >();
//     // const [volumeSeriesData, setVolumeSeriesData] = useState<volumeSeriesData | undefined>();
//     const [selectedTimeFrame, setVelectedTimeFrame] =
//         useState<ChartDataTimeframe>(ChartDataTimeframe.all);

//     if (IS_LOCAL_ENV) {
//         useEffect(() => {
//             console.debug({ tvlSeriesData });
//         }, [tvlSeriesData]);

//         useEffect(() => {
//             console.debug({ volumeSeriesData });
//         }, [volumeSeriesData]);
//     }
//     // useEffect(() => {
//     //     getChainStatsFresh(chainData.chainId)
//     //         .then((dexStats) => {
//     //             if (dexStats.tvl)
//     //                 setTotalTvlString('$' + formatAmount(dexStats.tvl));
//     //             if (dexStats.volume)
//     //                 setTotalVolumeString('$' + formatAmount(dexStats.volume));
//     //             if (dexStats.fees)
//     //                 setTotalFeesString('$' + formatAmount(dexStats.fees));
//     //         })
//     //         .catch(console.error);
//     //     getDexTvlSeries(selectedTimeFrame.toString())
//     //         .then((tvlSeriesData) => {
//     //             setTvlSeriesData(tvlSeriesData);
//     //         })
//     //         .catch(console.error);

//     //     getDexVolumeSeries(selectedTimeFrame.toString())
//     //         .then((volumeSeriesData) => {
//     //             setVolumeSeriesData(volumeSeriesData);
//     //         })
//     //         .catch(console.error);
//     // }, [selectedTimeFrame]);

//     // const formattedTvlData = useMemo(() => {
//     //     if (tvlSeriesData) {
//     //         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     //         return tvlSeriesData.series.map((item: seriesDatum) => {
//     //             return {
//     //                 time: new Date(item.time * 1000),
//     //                 value: item.total,
//     //             };
//     //         });
//     //     } else {
//     //         return [];
//     //     }
//     // }, [tvlSeriesData]);

//     // const formattedVolumeData = useMemo(() => {
//     //     if (volumeSeriesData) {
//     //         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     //         return volumeSeriesData.series.map((item: seriesDatum) => {
//     //             return {
//     //                 time: new Date(item.time * 1000),
//     //                 value: item.total,
//     //             };
//     //         });
//     //     } else {
//     //         return [];
//     //     }
//     // }, [volumeSeriesData]);

//     useEffect(() => {
//         if (volumeHover === undefined && protocolData) {
//             setVolumeHover(protocolData.volumeUSD);
//         }
//     }, [protocolData, volumeHover]);

//     useEffect(() => {
//         if (liquidityHover === undefined && protocolData) {
//             setLiquidityHover(protocolData.tvlUSD);
//         }
//     }, [liquidityHover, protocolData]);

//     const timeFrame = (
//         <div className={styles.time_frame_container}>
//             <div className={styles.title}>Ambient Analytics</div>
//             <div className={styles.right_side}>
//                 <span>Timeframe</span>
//                 <button
//                     className={
//                         selectedTimeFrame === ChartDataTimeframe.oneDay
//                             ? styles.active_button2
//                             : styles.non_active_button2
//                     }
//                     onClick={() =>
//                         setVelectedTimeFrame(ChartDataTimeframe.oneDay)
//                     }
//                 >
//                     1d
//                     {selectedTimeFrame === ChartDataTimeframe.oneDay && (
//                         <motion.div
//                             layoutId='outline2'
//                             className={styles.outline2}
//                             initial={false}
//                             transition={spring}
//                         />
//                     )}
//                 </button>
//                 <button
//                     className={
//                         selectedTimeFrame === ChartDataTimeframe.oneMonth
//                             ? styles.active_button2
//                             : styles.non_active_button2
//                     }
//                     onClick={() =>
//                         setVelectedTimeFrame(ChartDataTimeframe.oneMonth)
//                     }
//                 >
//                     1M
//                     {selectedTimeFrame === ChartDataTimeframe.oneMonth && (
//                         <motion.div
//                             layoutId='outline2'
//                             className={styles.outline2}
//                             initial={false}
//                             transition={spring}
//                         />
//                     )}
//                 </button>
//                 <button
//                     className={
//                         selectedTimeFrame === ChartDataTimeframe.sixMonth
//                             ? styles.active_button2
//                             : styles.non_active_button2
//                     }
//                     onClick={() =>
//                         setVelectedTimeFrame(ChartDataTimeframe.sixMonth)
//                     }
//                 >
//                     6M
//                     {selectedTimeFrame === ChartDataTimeframe.sixMonth && (
//                         <motion.div
//                             layoutId='outline2'
//                             className={styles.outline2}
//                             initial={false}
//                             transition={spring}
//                         />
//                     )}
//                 </button>
//                 <button
//                     className={
//                         selectedTimeFrame === ChartDataTimeframe.oneYear
//                             ? styles.active_button2
//                             : styles.non_active_button2
//                     }
//                     onClick={() =>
//                         setVelectedTimeFrame(ChartDataTimeframe.oneYear)
//                     }
//                 >
//                     1Y
//                     {selectedTimeFrame === ChartDataTimeframe.oneYear && (
//                         <motion.div
//                             layoutId='outline2'
//                             className={styles.outline2}
//                             initial={false}
//                             transition={spring}
//                         />
//                     )}
//                 </button>
//                 <button
//                     className={
//                         selectedTimeFrame === ChartDataTimeframe.all
//                             ? styles.active_button2
//                             : styles.non_active_button2
//                     }
//                     onClick={() => setVelectedTimeFrame(ChartDataTimeframe.all)}
//                 >
//                     All
//                     {selectedTimeFrame === ChartDataTimeframe.all && (
//                         <motion.div
//                             layoutId='outline2'
//                             className={styles.outline2}
//                             initial={false}
//                             transition={spring}
//                         />
//                     )}
//                 </button>
//             </div>
//         </div>
//     );

//     const loading = (
//         <div className={styles.animatedImg}>
//             <img src={logo} width={110} alt='logo' />
//         </div>
//     );

//     const graphData = (
//         <motion.div
//             className={styles.graph_data}
//             initial={{ y: 10, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: -10, opacity: 0 }}
//             transition={{ duration: 0.3 }}
//         >
//             <div className={styles.graph_container}>
//                 <div className={styles.title}>Total Value Locked</div>

//                 <label className={styles.v4m1wv}>
//                     {valueTvl ? '$' + formatAmount(valueTvl) : '-'}
//                 </label>
//                 <br></br>
//                 <label className={styles.eJnjNO}>
//                     {valueTvlDate ? valueTvlDate + ' (UTC) ' : '-'}
//                 </label>
//                 <div className={styles.chart_container}>
//                     {' '}
//                     {formattedTvlData && formattedTvlData.length > 0 ? (
//                         <AreaChart
//                             data={formattedTvlData}
//                             valueTvl={valueTvl}
//                             valueTvlDate={valueTvlDate}
//                             setValueTvl={setValueTvl}
//                             setValueTvlDate={setValueTvlDate}
//                         />
//                     ) : (
//                         <>{loading}</>
//                     )}
//                 </div>
//             </div>
//             <div className={styles.graph_container}>
//                 <div className={styles.title}>Volume 24H</div>
//                 <label className={styles.eJnjNO}>
//                     {valueVolume ? '$' + formatAmount(valueVolume) : '-'}
//                 </label>
//                 <br></br>
//                 <label className={styles.eJnjNO}>
//                     {valueVolumeDate ? valueVolumeDate + ' (UTC) ' : '-'}
//                 </label>
//                 <div className={styles.chart_container}>
//                     {formattedVolumeData && formattedVolumeData.length > 0 ? (
//                         <BarChart
//                             data={formattedVolumeData}
//                             valueVolume={valueVolume}
//                             valueVolumeDate={valueVolumeDate}
//                             setValueVolume={setValueVolume}
//                             setValueVolumeDate={setValueVolumeDate}
//                             snapType={
//                                 selectedTimeFrame === ChartDataTimeframe.oneDay
//                                     ? 'days'
//                                     : selectedTimeFrame ===
//                                       ChartDataTimeframe.oneMonth
//                                     ? 'months'
//                                     : 'weeks'
//                             }
//                         />
//                     ) : (
//                         <>{loading}</>
//                     )}
//                 </div>
//             </div>
//         </motion.div>
//     );

//     const analyticsInfo = (
//         <motion.div
//             className={styles.info_container}
//             initial={{ y: 10, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: -10, opacity: 0 }}
//             transition={{ duration: 0.4 }}
//         >
//             <div className={styles.info_content}>
//                 <div className={styles.info_title}>Total TVL</div>
//                 <div className={styles.info_value}>
//                     {totalTvlString || '...'}
//                     {/* {formatDollarAmount(liquidityHover, 2, true)}{' '} */}
//                 </div>
//             </div>

//             <div className={styles.info_content}>
//                 <div className={styles.info_title}>24h Volume</div>
//                 <div className={styles.info_value}>
//                     {totalVolumeString || '...'}
//                 </div>
//                 {/* <div className={styles.info_value}>{formatDollarAmount(volumeHover, 2)}</div> */}
//             </div>

//             <div className={styles.info_content}>
//                 <div className={styles.info_title}>24h Fees</div>
//                 <div className={styles.info_value}>
//                     {totalFeesString || '...'}
//                 </div>
//                 {/* <div className={styles.info_value}>{formatDollarAmount(protocolData?.feesUSD)}</div> */}
//             </div>
//         </motion.div>
//     );
//     return (
//         <div className={styles.GraphContainers}>
//             {timeFrame}
//             {graphData}
//             {analyticsInfo}
//         </div>
//     );
// }
export default function GraphContainer() {
    return <div></div>; // prevent compilation error
}
