import styles from './TimeFrame.module.css';
import { useState, useRef, memo, useContext } from 'react';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import useOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import { candleTimeIF } from '../../../../../App/hooks/useChartSettings';
import { BrandContext } from '../../../../../contexts/BrandContext';

interface propsIF {
    candleTime: candleTimeIF;
}

function TimeFrame(props: propsIF) {
    const { candleTime } = props;

    const [showTimeFrameDropdown, setShowTimeFrameDropdown] = useState(false);

    const desktopView = useMediaQuery('(max-width: 968px)');

    const wrapperStyle = showTimeFrameDropdown
        ? styles.dropdown_wrapper_active
        : styles.dropdown_wrapper;

    const dropdownItemRef = useRef<HTMLDivElement>(null);
    const clickOutsideHandler = () => {
        setShowTimeFrameDropdown(false);
    };

    useOnClickOutside(dropdownItemRef, clickOutsideHandler);

    const { platformName } = useContext(BrandContext);

    const timeFrameMobile = (
        <div className={styles.dropdown_menu} ref={dropdownItemRef}>
            <button
                className={styles.time_frame_mobile_button}
                onClick={() => setShowTimeFrameDropdown(!showTimeFrameDropdown)}
                tabIndex={0}
                aria-label='Open time frame dropdown.'
            >
                Candle Duration
            </button>

            <div className={wrapperStyle}>
                {candleTime.defaults.map((option, idx) => (
                    <div className={styles.main_time_frame_container} key={idx}>
                        <button
                            onClick={() => {
                                candleTime.changeTime(option.seconds);
                                setShowTimeFrameDropdown(false);
                            }}
                            className={
                                ['futa'].includes(platformName)
                                    ? option.seconds === candleTime.time
                                        ? styles.futa_active_selected_button
                                        : styles.futa_non_active_selected_button
                                    : option.seconds === candleTime.time
                                      ? styles.active_selected_button
                                      : styles.non_active_selected_button
                            }
                            tabIndex={0}
                            aria-label={`Set time frame to ${option.readable}.`}
                        >
                            {option.readable}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    if (desktopView) return timeFrameMobile;

    return (
        <div
            className={
                ['futa'].includes(platformName)
                    ? styles.futa_chart_overlay_container
                    : styles.chart_overlay_container
            }
        >
            {candleTime.defaults.map((option, idx) => (
                <div className={styles.main_time_frame_container} key={idx}>
                    <button
                        onClick={() => candleTime.changeTime(option.seconds)}
                        className={
                            ['futa'].includes(platformName)
                                ? option.seconds === candleTime.time
                                    ? styles.futa_active_selected_button
                                    : styles.futa_non_active_selected_button
                                : option.seconds === candleTime.time
                                  ? styles.active_selected_button
                                  : styles.non_active_selected_button
                        }
                        tabIndex={0}
                        aria-label={`Set time frame to ${option.readable}.`}
                    >
                        {option.readable}
                    </button>
                </div>
            ))}
        </div>
    );
}

export default memo(TimeFrame);
