import { useContext } from 'react';
import { AiOutlineFullscreen } from 'react-icons/ai';
import { FiCopy } from 'react-icons/fi';
import { DefaultTooltip } from '../../../../components/Global/StyledTooltip/StyledTooltip';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { ChartContext } from '../../../../contexts/ChartContext';
import printDomToImage from '../../../../utils/functions/printDomToImage';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import TradeChartsTokenInfo from '../TradeChartsComponents/TradeChartsTokenInfo';
import styles from './TradeChartsHeader.module.css';
import { CandleContext } from '../../../../contexts/CandleContext';
import { useSimulatedIsPoolInitialized } from '../../../../App/hooks/useSimulatedIsPoolInitialized';

export const TradeChartsHeader = (props: { tradePage?: boolean }) => {
    const {
        isFullScreen: isChartFullScreen,
        setIsFullScreen: setIsChartFullScreen,
        canvasRef,
        chartCanvasRef,
        chartHeights,
        tradeTableState,
    } = useContext(ChartContext);
    const { isCandleDataNull } = useContext(CandleContext);

    const [, copy] = useCopyToClipboard();
    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

    const isPoolInitialized = useSimulatedIsPoolInitialized();

    const showNoChartData = !isPoolInitialized || isCandleDataNull;

    const copyChartToClipboard = async () => {
        if (canvasRef.current && chartCanvasRef.current) {
            const blob = isChartFullScreen
                ? await printDomToImage(chartCanvasRef.current, '#171d27')
                : await printDomToImage(
                      canvasRef.current,
                      '#171d27',
                      undefined,
                      // height, trade charts header + chart height
                      50 + chartHeights.current,
                  );
            if (blob) {
                copy(blob);
                openSnackbar('Chart image copied to clipboard', 'info');
            }
        }
    };

    const graphSettingsContent = (
        <div className={styles.graph_settings_container}>
            <DefaultTooltip
                interactive
                title={'Toggle Full Screen Chart'}
                enterDelay={500}
            >
                <button
                    onClick={() => setIsChartFullScreen(!isChartFullScreen)}
                    className={styles.fullscreen_button}
                >
                    <AiOutlineFullscreen
                        size={20}
                        id='trade_chart_full_screen_button'
                        aria-label='Full screen chart button'
                    />
                </button>
            </DefaultTooltip>
            <DefaultTooltip
                interactive
                title={'Copy to Clipboard'}
                enterDelay={500}
            >
                <button
                    onClick={copyChartToClipboard}
                    className={styles.fullscreen_button}
                >
                    <FiCopy
                        size={20}
                        id='trade_chart_save_image'
                        aria-label='Copy chart image button'
                    />
                </button>
            </DefaultTooltip>
        </div>
    );

    return (
        <div
            className={`${styles.token_info_container} ${
                props.tradePage && styles.trade_page_container_padding
            }`}
        >
            <TradeChartsTokenInfo />
            {tradeTableState === 'Expanded' || showNoChartData
                ? null
                : graphSettingsContent}
        </div>
    );
};
