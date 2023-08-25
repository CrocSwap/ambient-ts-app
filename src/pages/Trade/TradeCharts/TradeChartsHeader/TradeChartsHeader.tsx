import { useContext } from 'react';
import { AiOutlineFullscreen } from 'react-icons/ai';
import { FiCopy } from 'react-icons/fi';
import { DefaultTooltip } from '../../../../components/Global/StyledTooltip/StyledTooltip';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { ChartContext } from '../../../../contexts/ChartContext';
import printDomToImage from '../../../../utils/functions/printDomToImage';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import TradeChartsTokenInfo from '../TradeChartsComponents/TradeChartsTokenInfo';
import { CandleContext } from '../../../../contexts/CandleContext';
import { useSimulatedIsPoolInitialized } from '../../../../App/hooks/useSimulatedIsPoolInitialized';
import { FlexContainer } from '../../../../styled/Common';
import { HeaderButtons } from '../../../../styled/Components/Chart';

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
                      chartHeights.max - chartHeights.current - 4,
                  );
            if (blob) {
                copy(blob);
                openSnackbar('Chart image copied to clipboard', 'info');
            }
        }
    };

    const graphSettingsContent = (
        <FlexContainer justifyContent='flex-end' alignItems='center' gap={16}>
            <DefaultTooltip
                interactive
                title={'Toggle Full Screen Chart'}
                enterDelay={500}
            >
                <HeaderButtons
                    mobileHide
                    onClick={() => setIsChartFullScreen(!isChartFullScreen)}
                >
                    <AiOutlineFullscreen
                        size={20}
                        id='trade_chart_full_screen_button'
                        aria-label='Full screen chart button'
                    />
                </HeaderButtons>
            </DefaultTooltip>
            <DefaultTooltip
                interactive
                title={'Copy to Clipboard'}
                enterDelay={500}
            >
                <HeaderButtons mobileHide onClick={copyChartToClipboard}>
                    <FiCopy
                        size={20}
                        id='trade_chart_save_image'
                        aria-label='Copy chart image button'
                    />
                </HeaderButtons>
            </DefaultTooltip>
        </FlexContainer>
    );

    return (
        <FlexContainer
            justifyContent='space-between'
            padding={props.tradePage ? '12px 12px 0px 12px' : '4px 4px 8px 4px'}
        >
            <TradeChartsTokenInfo />
            {tradeTableState === 'Expanded' || showNoChartData
                ? null
                : graphSettingsContent}
        </FlexContainer>
    );
};
