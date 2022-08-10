import styles from './TradeCharts.module.css';

// icons
import {
    AiOutlineCamera,
    AiOutlineFullscreen,
    AiOutlineSetting,
    AiOutlineDownload,
    AiOutlineCopy,
    AiOutlineLink,
    AiOutlineTwitter,
} from 'react-icons/ai';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { DefaultTooltip } from '../../../components/Global/StyledTooltip/StyledTooltip';
import { motion } from 'framer-motion';

// end of icons
import {
    // eslint-disable-next-line
    tradeData as TradeDataIF,
    toggleDidUserFlipDenom,
    setActiveChartPeriod,
} from '../../../utils/state/tradeDataSlice';
import { useAppSelector, useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { Dispatch, SetStateAction, useState, useEffect, useMemo } from 'react';
// import truncateDecimals from '../../../utils/data/truncateDecimals';
import TradeCandleStickChart from './TradeCandleStickChart';
interface TradeChartsProps {
    // denomInTokenA: boolean;
    // tokenASymbol: string;
    // tokenBSymbol: string;
    poolPriceDisplay: number;
    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
    isTokenABase: boolean;
}

// trade charts
import { ONE_HOUR_SECONDS, TimeWindow } from '../../../constants/intervals';
import { currentTimestamp } from '../../../utils';
import { PriceChartEntry } from '../../../types';
import { usePoolChartData } from '../../../state/pools/hooks';
import { useTokenData, useTokenPriceData } from '../../../state/tokens/hooks';
import getUnicodeCharacter from '../../../utils/functions/getUnicodeCharacter';

//
export default function TradeCharts(props: TradeChartsProps) {
    const { poolPriceDisplay } = props;

    const dispatch = useAppDispatch();
    const [fullScreenChart, setFullScreenChart] = useState(false);

    // ---------------------TRADE DATA CALCULATIONS------------------------

    const tradeData = useAppSelector((state) => state.tradeData);

    const graphData = useAppSelector((state) => state.graphData);

    const mainnetCandlePoolDefinition = JSON.stringify({
        baseAddress: '0x0000000000000000000000000000000000000000',
        quoteAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
        poolIdx: 36000,
        network: '0x1',
    }).toLowerCase();

    const indexOfMainnetCandlePool = graphData.candlesForAllPools.pools
        .map((item) => JSON.stringify(item.pool).toLowerCase())
        .findIndex((pool) => pool === mainnetCandlePoolDefinition);

    const mainnetCandleData = graphData.candlesForAllPools.pools[indexOfMainnetCandlePool];

    useEffect(() => {
        console.log({ mainnetCandleData });
    }, [mainnetCandleData]);

    const isTokenABase = props.isTokenABase;
    const setActivePeriod = (period: number) => {
        dispatch(setActiveChartPeriod(period));
    };
    const denomInBase = tradeData.isDenomBase;
    const denomInTokenA = (denomInBase && isTokenABase) || (!denomInBase && !isTokenABase);
    const tokenASymbol = tradeData.tokenA.symbol;
    const tokenBSymbol = tradeData.tokenB.symbol;

    const truncatedPoolPrice =
        poolPriceDisplay < 2
            ? poolPriceDisplay.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : poolPriceDisplay.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    // const truncatedPoolPrice =
    //     poolPriceDisplay < 2
    //         ? truncateDecimals(poolPriceDisplay, 4)
    //         : truncateDecimals(poolPriceDisplay, 2);
    // ---------------------END OF TRADE DATA CALCULATIONS------------------------

    // GRAPH SETTINGS CONTENT------------------------------------------------------

    const saveImageContent = (
        <div className={styles.save_image_container}>
            <div className={styles.save_image_content}>
                <AiOutlineDownload />
                Save Chart Image
            </div>
            <div className={styles.save_image_content}>
                <AiOutlineCopy />
                Copy Chart Image
            </div>
            <div className={styles.save_image_content}>
                <AiOutlineLink />
                Copy link to the chart image
            </div>
            <div className={styles.save_image_content}>
                <HiOutlineExternalLink />
                Open image in new tab
            </div>
            <div className={styles.save_image_content}>
                <AiOutlineTwitter />
                Tweet chart image
            </div>
        </div>
    );

    // eslint-disable-next-line
    function closeOnEscapeKeyDown(e: any) {
        if ((e.charCode || e.keyCode) === 27) setFullScreenChart(false);
    }

    useEffect(() => {
        document.body.addEventListener('keydown', closeOnEscapeKeyDown);
        return function cleanUp() {
            document.body.removeEventListener('keydown', closeOnEscapeKeyDown);
        };
    });
    const graphSettingsContent = (
        <div className={styles.graph_settings_container}>
            <div>
                <AiOutlineSetting size={20} />
            </div>
            <div onClick={() => setFullScreenChart(true)}>
                <AiOutlineFullscreen size={20} />
            </div>
            <DefaultTooltip interactive title={saveImageContent}>
                <div>
                    <AiOutlineCamera size={20} />
                </div>
            </DefaultTooltip>
        </div>
    );

    // END OF GRAPH SETTINGS CONTENT------------------------------------------------------

    // ---------------------------ACTIVE OVERLAY BUTTON FUNCTIONALITY-------------------------------
    const [activerOverlayButton, setActiveOverlayButton] = useState('Curve');
    const chartOverlayButtonData = [
        { name: 'Volume' },
        { name: 'TVL' },
        { name: 'Fee Rate' },
        { name: 'Heatmap' },
        { name: 'Liquidity Profile' },
        { name: 'Curve' },
        { name: 'Depth' },
    ];

    function handleOverlayButtonClick(name: string) {
        setActiveOverlayButton(name);
    }

    const chartOverlayButtons = chartOverlayButtonData.map((button, idx) => (
        <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.settings_container}
            key={idx}
        >
            <button
                onClick={() => handleOverlayButtonClick(button.name)}
                className={
                    button.name === activerOverlayButton
                        ? styles.active_button
                        : styles.non_active_button
                }
            >
                {button.name}

                {button.name === activerOverlayButton && (
                    <motion.div
                        layoutId='outline'
                        className={styles.outline}
                        initial={false}
                        // animate={{ borderColor: 'red' }}
                        transition={spring}
                    />
                )}
            </button>
        </motion.div>
    ));
    // --------------------------- END OF ACTIVE OVERLAY BUTTON FUNCTIONALITY-------------------------------

    // --------------------------- TIME FRAME BUTTON FUNCTIONALITY-------------------------------

    const activeTimeFrameData = [
        { label: '1m', activePeriod: 60 },
        { label: '5m', activePeriod: 300 },
        { label: '15m', activePeriod: 900 },
        { label: '1h', activePeriod: 3600 },
        { label: '4h', activePeriod: 14400 },
        { label: '1d', activePeriod: 86400 },
    ];
    const [activeTimeFrame, setActiveTimeFrame] = useState('1m');

    function handleTimeFrameButtonClick(label: string, time: number) {
        setActiveTimeFrame(label);
        setActivePeriod(time);
    }

    const activeTimeFrameDisplay = activeTimeFrameData.map((time, idx) => (
        <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.settings_container}
            key={idx}
        >
            <button
                onClick={() => handleTimeFrameButtonClick(time.label, time.activePeriod)}
                className={
                    time.label === activeTimeFrame
                        ? styles.active_button2
                        : styles.non_active_button2
                }
            >
                {time.label}

                {time.label === activeTimeFrame && (
                    <motion.div
                        layoutId='outline2'
                        className={styles.outline2}
                        initial={false}
                        // animate={{ borderColor: 'red' }}
                        transition={spring}
                    />
                )}
            </button>
        </motion.div>
    ));

    // --------------------------- END OF TIME FRAME BUTTON FUNCTIONALITY-------------------------------

    // TOKEN INFO----------------------------------------------------------------
    const tokenInfo = (
        <div className={styles.token_info_container}>
            <div className={styles.tokens_info} onClick={() => dispatch(toggleDidUserFlipDenom())}>
                <div className={styles.tokens_images}>
                    <img
                        src={denomInTokenA ? tradeData.tokenA.logoURI : tradeData.tokenB.logoURI}
                        // src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png'
                        alt='token'
                        width='30px'
                    />
                    <img
                        src={denomInTokenA ? tradeData.tokenB.logoURI : tradeData.tokenA.logoURI}
                        // src='https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
                        alt='token'
                        width='30px'
                    />
                </div>
                <span className={styles.tokens_name}>
                    {denomInTokenA ? tokenASymbol : tokenBSymbol} /{' '}
                    {denomInTokenA ? tokenBSymbol : tokenASymbol}
                </span>
            </div>
            <div className={styles.chart_overlay_container}>{chartOverlayButtons}</div>
        </div>
    );
    // END OF TOKEN INFO----------------------------------------------------------------

    // TIME FRAME CONTENT--------------------------------------------------------------

    const currencyCharacter = denomInTokenA
        ? // denom in a, return token b character
          getUnicodeCharacter(tradeData.tokenB.symbol)
        : // denom in b, return token a character
          getUnicodeCharacter(tradeData.tokenA.symbol);

    const timeFrameContent = (
        <div className={styles.time_frame_container}>
            <div className={styles.left_side}>
                <span
                    className={styles.amount}
                    // onClick={() => dispatch(toggleDidUserFlipDenom())}
                >
                    {poolPriceDisplay === Infinity
                        ? '...'
                        : `${currencyCharacter}${truncatedPoolPrice}`}
                </span>
                <span className={styles.change}>+8.57% | 24h</span>
            </div>
            <div className={styles.right_side}>
                <span>Timeframe</span>
                {activeTimeFrameDisplay}
            </div>
        </div>
    );

    // END OF TIME FRAME CONTENT--------------------------------------------------------------

    // CANDLE STICK DATA---------------------------------------------------
    const DEFAULT_TIME_WINDOW = TimeWindow.WEEK;

    const [timeWindow] = useState(DEFAULT_TIME_WINDOW);
    const chartData = usePoolChartData('0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8'); // ETH/USDC pool address
    const tokenData = useTokenData('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'); // ETH address
    const priceData = useTokenPriceData(
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // ETH address
        ONE_HOUR_SECONDS,
        timeWindow,
    );

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
    // END OF CANDLE STICK DATA---------------------------------------------------
    const fullScreenStyle = fullScreenChart ? styles.chart_full_screen : styles.chart_image;

    const expandGraphStyle = props.expandTradeTable ? styles.hide_graph : '';

    return (
        <div>
            <div className={`${styles.graph_style} ${expandGraphStyle} ${fullScreenStyle}`}>
                {graphSettingsContent}
                {tokenInfo}
                {timeFrameContent}
            </div>

            <TradeCandleStickChart
                tvlData={formattedTvlData}
                volumeData={formattedVolumeData}
                feeData={formattedFeesUSD}
                priceData={adjustedToCurrent}
            />
        </div>
    );
}

const spring = {
    type: 'spring',
    stiffness: 500,
    damping: 30,
};
