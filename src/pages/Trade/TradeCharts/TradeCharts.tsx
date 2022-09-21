// START: Import React and Dongles
import { Dispatch, SetStateAction, useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    AiOutlineCamera,
    AiOutlineFullscreen,
    AiOutlineDownload,
    AiOutlineCopy,
    AiOutlineLink,
    AiOutlineTwitter,
} from 'react-icons/ai';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';

// START: Import JSX Components
import { DefaultTooltip } from '../../../components/Global/StyledTooltip/StyledTooltip';

// START: Import Local Files
import styles from './TradeCharts.module.css';
import printDomToImage from '../../../utils/functions/printDomToImage';
import getUnicodeCharacter from '../../../utils/functions/getUnicodeCharacter';
import {
    // eslint-disable-next-line
    tradeData as TradeDataIF,
    toggleDidUserFlipDenom,
    setActiveChartPeriod,
    targetData,
} from '../../../utils/state/tradeDataSlice';
import { CandleData, CandlesByPoolAndDuration } from '../../../utils/state/graphDataSlice';
import { usePoolChartData } from '../../../state/pools/hooks';
import { useAppSelector, useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import TradeCandleStickChart from './TradeCandleStickChart';
import { PoolIF, TokenIF } from '../../../utils/interfaces/exports';
import { get24hChange } from '../../../App/functions/getPoolStats';
import TradeChartsLoading from './TradeChartsLoading/TradeChartsLoading';

// interface for React functional component props
interface TradeChartsPropsIF {
    chainId: string;
    lastBlockNumber: number;
    poolPriceDisplay: number;
    expandTradeTable: boolean;
    setExpandTradeTable: Dispatch<SetStateAction<boolean>>;
    isTokenABase: boolean;
    fullScreenChart: boolean;
    setFullScreenChart: Dispatch<SetStateAction<boolean>>;
    changeState: (isOpen: boolean | undefined, candleData: CandleData | undefined) => void;
    candleData: CandlesByPoolAndDuration | undefined;
    targetData: targetData[] | undefined;
    limitPrice: string | undefined;
    setLimitRate: React.Dispatch<React.SetStateAction<string>>;
    limitRate: string;
    favePools: PoolIF[];
    addPoolToFaves: (tokenA: TokenIF, tokenB: TokenIF, chainId: string, poolId: number) => void;
    removePoolFromFaves: (
        tokenA: TokenIF,
        tokenB: TokenIF,
        chainId: string,
        poolId: number,
    ) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    liquidityData: any;
    isAdvancedModeActive: boolean | undefined;
    simpleRangeWidth: number | undefined;
    pinnedMinPriceDisplayTruncated: number | undefined;
    pinnedMaxPriceDisplayTruncated: number | undefined;
    spotPriceDisplay: string | undefined;
    upBodyColor: string;
    upBorderColor: string;
    downBodyColor: string;
    downBorderColor: string;
}

export interface CandleChartData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    date: any;
    open: number;
    high: number;
    low: number;
    close: number;
    time: number;
    allSwaps: unknown;
}
export interface LiquidityData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeLiq: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    upperBoundPriceDecimalCorrected: any;
}

// React functional component
export default function TradeCharts(props: TradeChartsPropsIF) {
    const {
        isTokenABase,
        poolPriceDisplay,
        fullScreenChart,
        setFullScreenChart,
        lastBlockNumber,
        chainId,
        addPoolToFaves,
        removePoolFromFaves,
        favePools,
        expandTradeTable,
    } = props;

    const dispatch = useAppDispatch();

    // ---------------------TRADE DATA CALCULATIONS------------------------

    const { tradeData } = useAppSelector((state) => state);
    const { poolIndex } = lookupChain(chainId);

    const setActivePeriod = (period: number) => {
        dispatch(setActiveChartPeriod(period));
    };
    const denomInBase = tradeData.isDenomBase;
    // const denomInTokenA = (denomInBase && isTokenABase) || (!denomInBase && !isTokenABase);
    // const tokenASymbol = tradeData.tokenA.symbol;
    // const tokenBSymbol = tradeData.tokenB.symbol;
    const tokenAAddress = tradeData.tokenA.address;
    const tokenBAddress = tradeData.tokenB.address;

    const truncatedPoolPrice =
        poolPriceDisplay === Infinity || poolPriceDisplay === 0
            ? '…'
            : poolPriceDisplay < 2
            ? poolPriceDisplay.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
              })
            : poolPriceDisplay.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              });

    // ---------------------END OF TRADE DATA CALCULATIONS------------------------

    // GRAPH SETTINGS CONTENT------------------------------------------------------
    const canvasRef = useRef(null);
    const downloadAsImage = () => {
        if (canvasRef.current) {
            printDomToImage(canvasRef.current);
        }
    };
    const saveImageContent = (
        <div className={styles.save_image_container}>
            <div className={styles.save_image_content} onClick={downloadAsImage}>
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
    // CHART SETTINGS------------------------------------------------------------
    // const [openSettingsTooltip, setOpenSettingsTooltip] = useState(false);
    const [showTvl, setShowTvl] = useState(false);
    const [showFeeRate, setShowFeeRate] = useState(false);
    const [showVolume, setShowVolume] = useState(false);

    const chartItemStates = { showFeeRate, showTvl, showVolume };

    // END OF CHART SETTINGS------------------------------------------------------------

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
            <div onClick={() => setFullScreenChart(!fullScreenChart)}>
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

    const [poolPriceChangePercent, setPoolPriceChangePercent] = useState<string | undefined>(
        undefined,
    );
    const [isPoolPriceChangePositive, setIsPoolPriceChangePositive] = useState<boolean>(true);

    const baseTokenAddress = isTokenABase ? tokenAAddress : tokenBAddress;
    const quoteTokenAddress = isTokenABase ? tokenBAddress : tokenAAddress;

    useEffect(() => {
        (async () => {
            if (tokenAAddress && tokenBAddress) {
                try {
                    const priceChangeResult = await get24hChange(
                        chainId,
                        baseTokenAddress,
                        quoteTokenAddress,
                        poolIndex,
                        denomInBase,
                    );

                    if (priceChangeResult > -0.01 && priceChangeResult < 0.01) {
                        setPoolPriceChangePercent('No Change');
                    } else if (priceChangeResult) {
                        priceChangeResult > 0
                            ? setIsPoolPriceChangePositive(true)
                            : setIsPoolPriceChangePositive(false);

                        const priceChangeString =
                            priceChangeResult > 0
                                ? '+' +
                                  priceChangeResult.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  }) +
                                  '%'
                                : priceChangeResult.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                  }) + '%';
                        setPoolPriceChangePercent(priceChangeString);
                    } else {
                        setPoolPriceChangePercent(undefined);
                    }
                } catch (error) {
                    setPoolPriceChangePercent(undefined);
                }
            }
        })();
    }, [denomInBase, baseTokenAddress, quoteTokenAddress, lastBlockNumber]);

    // ---------------------------ACTIVE OVERLAY BUTTON FUNCTIONALITY-------------------------------

    // this could be simplify into 1 reusable function but I figured we might have to do some other calculations for each of these so I am sepearing it for now. -Jr
    const handleVolumeToggle = () => setShowVolume(!showVolume);

    const handleTvlToggle = () => setShowTvl(!showTvl);
    const handleFeeRateToggle = () => setShowFeeRate(!showFeeRate);

    const exampleAction = () => console.log('example');

    const chartOverlayButtonData1 = [
        { name: 'Volume', selected: showVolume, action: handleVolumeToggle },
        { name: 'TVL', selected: showTvl, action: handleTvlToggle },
        { name: 'Fee Rate', selected: showFeeRate, action: handleFeeRateToggle },
    ];

    const chartOverlayButtonData2 = [
        { name: 'Curve', selected: false, action: exampleAction },
        { name: 'Depth', selected: false, action: exampleAction },
    ];

    const chartOverlayButtons1 = chartOverlayButtonData1.map((button, idx) => (
        <div className={styles.settings_container} key={idx}>
            <button
                onClick={button.action}
                className={
                    button.selected
                        ? styles.active_selected_button
                        : styles.non_active_selected_button
                }
            >
                {button.name}
            </button>
        </div>
    ));

    const chartOverlayButtons2 = chartOverlayButtonData2.map((button, idx) => (
        <div className={styles.settings_container} key={idx}>
            <button
                onClick={button.action}
                className={
                    button.selected
                        ? styles.active_selected_button
                        : styles.non_active_selected_button
                }
            >
                {button.name}
            </button>
        </div>
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
    const [activeTimeFrame, setActiveTimeFrame] = useState('5m');

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
                        transition={spring}
                    />
                )}
            </button>
        </motion.div>
    ));

    // --------------------------- END OF TIME FRAME BUTTON FUNCTIONALITY-------------------------------

    // --------------------------- LIQUIDITY TYPE BUTTON FUNCTIONALITY-------------------------------
    const liquidityTypeData = [{ label: 'Depth' }, { label: 'Curve' }];
    const [liquidityType, setLiquidityType] = useState('depth');

    function handleLiquidityTypeButtonClick(label: string) {
        setLiquidityType(label.toLowerCase());
    }

    const liquidityTypeDisplay = liquidityTypeData.map((type, idx) => (
        <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`${styles.settings_container} `}
            key={idx}
        >
            <button
                onClick={() => handleLiquidityTypeButtonClick(type.label)}
                className={
                    type.label.toLowerCase() === liquidityType
                        ? styles.active_button2
                        : styles.non_active_button2
                }
            >
                {type.label}

                {type.label.toLowerCase() === liquidityType && (
                    <motion.div
                        layoutId='outline'
                        className={styles.outline}
                        initial={false}
                        transition={spring}
                    />
                )}
            </button>
        </motion.div>
    ));
    // eslint-disable-next-line
    const liquidityTypeContent = (
        <div className={styles.liquidity_type_container}>
            <div />
            <div className={styles.liquidity_type_content}>
                <span>Liquidity Type</span>

                {liquidityTypeDisplay}
            </div>
        </div>
    );
    // --------------------------- END OF LIQUIDITY TYPE BUTTON FUNCTIONALITY-------------------------------
    // TOKEN INFO----------------------------------------------------------------

    // console.log({ favePools });
    const currentPoolData = {
        base: tradeData.baseToken,
        quote: tradeData.quoteToken,
        chainId: chainId,
        poolId: 36000,
    };

    const isButtonFavorited = favePools?.some(
        (pool: PoolIF) =>
            pool.base.address === currentPoolData.base.address &&
            pool.quote.address === currentPoolData.quote.address &&
            pool.poolId === currentPoolData.poolId &&
            pool.chainId.toString() === currentPoolData.chainId.toString(),
    );

    const handleFavButton = () =>
        isButtonFavorited
            ? removePoolFromFaves(tradeData.baseToken, tradeData.quoteToken, chainId, 36000)
            : addPoolToFaves(tradeData.quoteToken, tradeData.baseToken, chainId, 36000);

    const favButton = (
        <motion.div
            whileTap={{ scale: 3 }}
            transition={{ duration: 0.5 }}
            onClick={handleFavButton}
            className={styles.fav_button}
            style={{
                cursor: 'pointer',
            }}
        >
            <svg
                width='23'
                height='23'
                viewBox='0 0 23 23'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
            >
                <path
                    d='M11.5 1.58301L14.7187 8.10384L21.9166 9.15593L16.7083 14.2288L17.9375 21.3955L11.5 18.0101L5.06248 21.3955L6.29165 14.2288L1.08331 9.15593L8.28123 8.10384L11.5 1.58301Z'
                    stroke='#ebebff'
                    fill={isButtonFavorited ? '#ebebff' : 'none'}
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className={styles.star_svg}
                />
            </svg>
        </motion.div>
    );

    const tokenInfo = (
        <div className={styles.token_info_container}>
            <div className={styles.tokens_info}>
                {favButton}
                <div
                    className={styles.tokens_images}
                    onClick={() => dispatch(toggleDidUserFlipDenom())}
                >
                    <img
                        src={
                            denomInBase ? tradeData.baseToken.logoURI : tradeData.quoteToken.logoURI
                        }
                        alt='token'
                        width='30px'
                    />
                    <img
                        src={
                            denomInBase ? tradeData.quoteToken.logoURI : tradeData.baseToken.logoURI
                        }
                        alt='token'
                        width='30px'
                    />
                </div>
                <span
                    className={styles.tokens_name}
                    onClick={() => dispatch(toggleDidUserFlipDenom())}
                >
                    {denomInBase ? tradeData.baseToken.symbol : tradeData.quoteToken.symbol} /{' '}
                    {denomInBase ? tradeData.quoteToken.symbol : tradeData.baseToken.symbol}
                </span>
            </div>

            <div className={styles.chart_overlay_container}>{chartOverlayButtons1}</div>
            <div className={styles.chart_overlay_container}>{chartOverlayButtons2}</div>
        </div>
    );
    // END OF TOKEN INFO----------------------------------------------------------------

    // TIME FRAME CONTENT--------------------------------------------------------------

    const currencyCharacter = denomInBase
        ? // denom in a, return token b character
          getUnicodeCharacter(tradeData.quoteToken.symbol)
        : // denom in b, return token a character
          getUnicodeCharacter(tradeData.baseToken.symbol);

    // console.log({ poolPriceChangePercent });
    const timeFrameContent = (
        <div className={styles.time_frame_container}>
            <div className={styles.left_side}>
                <span className={styles.amount}>
                    {poolPriceDisplay === Infinity || poolPriceDisplay === 0
                        ? '…'
                        : `${currencyCharacter}${truncatedPoolPrice}`}
                </span>
                <span
                    className={
                        isPoolPriceChangePositive ? styles.change_positive : styles.change_negative
                    }
                >
                    {poolPriceChangePercent === undefined ? '…' : poolPriceChangePercent + ' | 24h'}
                </span>
            </div>
            <div className={styles.right_side}>
                {/* <span>Timeframe</span> */}
                {activeTimeFrameDisplay}
            </div>
        </div>
    );

    // END OF TIME FRAME CONTENT--------------------------------------------------------------

    // CURRENT DATA INFO----------------------------------------------------------------
    const [currentData, setCurrentData] = useState<CandleChartData>();

    function formattedCurrentData(data: number): string {
        return data
            ? data.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : '';
    }

    const currentDataInfo = (
        <div className={styles.current_data_info}>
            {denomInBase ? tradeData.baseToken.symbol : tradeData.quoteToken.symbol} /{' '}
            {denomInBase ? tradeData.quoteToken.symbol : tradeData.baseToken.symbol}·{' '}
            {activeTimeFrame} ·{' '}
            {currentData
                ? 'O: ' +
                  formattedCurrentData(currentData.open) +
                  ' H: ' +
                  formattedCurrentData(currentData.high) +
                  ' L: ' +
                  formattedCurrentData(currentData.low) +
                  ' C: ' +
                  formattedCurrentData(currentData.close)
                : ''}
        </div>
    );

    // END OF CURRENT DATA INFO--------------------------------------------------------------

    // CANDLE STICK DATA---------------------------------------------------
    const chartData = usePoolChartData('0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8'); // ETH/USDC pool address

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
    // This is a simple loading that last for 1 sec before displaying the graph. The graph is already in the dom by then. We will just positon this in front of it and then remove it after 1 sec.

    const expandGraphStyle = props.expandTradeTable ? styles.hide_graph : '';

    const [graphIsLoading, setGraphIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setGraphIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <div className={`${styles.graph_style} ${expandGraphStyle}`}>
                {graphSettingsContent}
                {tokenInfo}
                {timeFrameContent}
                {/* {liquidityTypeContent} */}
                {currentDataInfo}
            </div>
            {graphIsLoading ? (
                <TradeChartsLoading />
            ) : (
                <div style={{ width: '100%', height: '100%' }} ref={canvasRef}>
                    <TradeCandleStickChart
                        tvlData={formattedTvlData}
                        expandTradeTable={expandTradeTable}
                        volumeData={formattedVolumeData}
                        feeData={formattedFeesUSD}
                        priceData={props.candleData}
                        changeState={props.changeState}
                        chartItemStates={chartItemStates}
                        targetData={props.targetData}
                        limitPrice={props.limitPrice}
                        setLimitRate={props.setLimitRate}
                        limitRate={props.limitRate}
                        denomInBase={denomInBase}
                        liquidityData={props.liquidityData}
                        isAdvancedModeActive={props.isAdvancedModeActive}
                        simpleRangeWidth={props.simpleRangeWidth}
                        pinnedMinPriceDisplayTruncated={props.pinnedMinPriceDisplayTruncated}
                        pinnedMaxPriceDisplayTruncated={props.pinnedMaxPriceDisplayTruncated}
                        spotPriceDisplay={props.spotPriceDisplay}
                        truncatedPoolPrice={parseFloat(truncatedPoolPrice)}
                        setCurrentData={setCurrentData}
                        upBodyColor={props.upBodyColor}
                        upBorderColor={props.upBorderColor}
                        downBodyColor={props.downBodyColor}
                        downBorderColor={props.downBorderColor}
                    />
                </div>
            )}
        </>
    );
}

const spring = {
    type: 'spring',
    stiffness: 500,
    damping: 30,
};
