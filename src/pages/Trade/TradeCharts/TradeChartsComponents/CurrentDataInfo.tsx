import styles from './CurrentDataInfo.module.css';
import { formatDollarAmountAxis } from '../../../../utils/numbers';
import { Dispatch, memo, SetStateAction } from 'react';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { CandleData } from '../../../../App/functions/fetchCandleSeries';
import { getFormattedNumber } from '../../../../App/functions/getFormattedNumber';

interface CurrentDataInfoPropsIF {
    showTooltip: boolean;
    currentData: CandleData | undefined;
    currentVolumeData: number | undefined;
    showLatest: boolean;
    setLatest: Dispatch<SetStateAction<boolean>>;
    setReset: Dispatch<SetStateAction<boolean>>;
    setRescale: Dispatch<SetStateAction<boolean>>;
    rescale: boolean;
    reset: boolean;
}
function CurrentDataInfo(props: CurrentDataInfoPropsIF) {
    const {
        showTooltip,
        currentData,
        currentVolumeData,
        showLatest,
        setLatest,
        setReset,
        setRescale,
        rescale,
        reset,
    } = props;

    function formattedCurrentData(data: number | undefined) {
        return getFormattedNumber({ value: data, zeroDisplay: '-' });
    }

    const tradeData = useAppSelector((state) => state.tradeData);
    const denominationsInBase = tradeData.isDenomBase;

    return (
        <div className={styles.chart_tooltips}>
            {showTooltip ? (
                <div className={styles.current_data_info}>
                    {currentData &&
                        'O: ' +
                            formattedCurrentData(
                                denominationsInBase
                                    ? currentData.invPriceOpenExclMEVDecimalCorrected
                                    : currentData.priceOpenExclMEVDecimalCorrected,
                            ) +
                            ' H: ' +
                            formattedCurrentData(
                                denominationsInBase
                                    ? currentData.invMinPriceExclMEVDecimalCorrected
                                    : currentData.maxPriceExclMEVDecimalCorrected,
                            ) +
                            ' L: ' +
                            formattedCurrentData(
                                denominationsInBase
                                    ? currentData.invMaxPriceExclMEVDecimalCorrected
                                    : currentData.minPriceExclMEVDecimalCorrected,
                            ) +
                            ' C: ' +
                            formattedCurrentData(
                                denominationsInBase
                                    ? currentData.invPriceCloseExclMEVDecimalCorrected
                                    : currentData.priceCloseExclMEVDecimalCorrected,
                            ) +
                            ' V: ' +
                            formatDollarAmountAxis(currentVolumeData)}
                </div>
            ) : (
                <div className={styles.current_data_info} />
            )}

            <div className={styles.chart_overlay_container}>
                {showLatest && (
                    <div className={styles.settings_container}>
                        <button
                            onClick={() => {
                                if (rescale) {
                                    setReset(true);
                                } else {
                                    setLatest(true);
                                }
                            }}
                            className={styles.non_active_selected_button}
                            aria-label='Show latest.'
                        >
                            Latest
                        </button>
                    </div>
                )}

                <div className={styles.settings_container}>
                    <button
                        onClick={() => {
                            setReset(true);
                            setRescale(true);
                        }}
                        className={
                            reset
                                ? styles.active_selected_button
                                : styles.non_active_selected_button
                        }
                        aria-label='Reset.'
                    >
                        Reset
                    </button>
                </div>

                <div className={styles.settings_container}>
                    <button
                        onClick={() => {
                            setRescale((prevState) => {
                                return !prevState;
                            });
                        }}
                        className={
                            rescale
                                ? styles.active_selected_button
                                : styles.non_active_selected_button
                        }
                        aria-label='Auto rescale.'
                    >
                        Auto
                    </button>
                </div>
            </div>
        </div>
    );
}

export default memo(CurrentDataInfo);
