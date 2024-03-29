import styles from './CurrentDataInfo.module.css';
import { formatDollarAmountAxis } from '../../../../utils/numbers';
import { Dispatch, memo, SetStateAction, useContext } from 'react';
import { CandleDataIF } from '../../../../ambient-utils/types';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import useDollarPrice from '../../../Chart/ChartUtils/getDollarPrice';

interface CurrentDataInfoPropsIF {
    showTooltip: boolean;
    currentData: CandleDataIF | undefined;
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

    const smallScreen = useMediaQuery('(max-width: 500px)');

    const getDollarPrice = useDollarPrice();

    const { isDenomBase } = useContext(TradeDataContext);

    return (
        <div className={styles.chart_tooltips}>
            {showTooltip ? (
                <div
                    className={styles.current_data_info}
                    style={{ marginLeft: smallScreen ? '0px' : '15px' }}
                >
                    {currentData &&
                        'O: ' +
                            getDollarPrice(
                                isDenomBase
                                    ? currentData.invPriceOpenExclMEVDecimalCorrected
                                    : currentData.priceOpenExclMEVDecimalCorrected,
                            ).formattedValue +
                            ' H: ' +
                            getDollarPrice(
                                isDenomBase
                                    ? currentData.invMinPriceExclMEVDecimalCorrected
                                    : currentData.maxPriceExclMEVDecimalCorrected,
                            ).formattedValue +
                            ' L: ' +
                            getDollarPrice(
                                isDenomBase
                                    ? currentData.invMaxPriceExclMEVDecimalCorrected
                                    : currentData.minPriceExclMEVDecimalCorrected,
                            ).formattedValue +
                            ' C: ' +
                            getDollarPrice(
                                isDenomBase
                                    ? currentData.invPriceCloseExclMEVDecimalCorrected
                                    : currentData.priceCloseExclMEVDecimalCorrected,
                            ).formattedValue +
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
