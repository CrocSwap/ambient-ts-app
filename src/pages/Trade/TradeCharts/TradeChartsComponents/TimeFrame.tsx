import styles from './TimeFrame.module.css';
import { Dispatch, SetStateAction, useState, useRef } from 'react';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import useOnClickOutside from '../../../../utils/hooks/useOnClickOutside';

interface TimeFramePropsIF {
    activeTimeFrame: string;
    setActiveTimeFrame: Dispatch<SetStateAction<string>>;
    setActivePeriod: (period: number) => void;
}
export default function TimeFrame(props: TimeFramePropsIF) {
    const { setActiveTimeFrame, setActivePeriod, activeTimeFrame } = props;

    const [showTimeFrameDropdown, setShowTimeFrameDropdown] = useState(false);

    const desktopView = useMediaQuery('(max-width: 968px)');

    const activeTimeFrameData = [
        { label: '1m', activePeriod: 60 },
        { label: '5m', activePeriod: 300 },
        { label: '15m', activePeriod: 900 },
        { label: '1h', activePeriod: 3600 },
        { label: '4h', activePeriod: 14400 },
        { label: '1d', activePeriod: 86400 },
    ];

    function handleTimeFrameButtonClick(label: string, time: number) {
        setActiveTimeFrame(label);
        setActivePeriod(time);
    }

    const wrapperStyle = showTimeFrameDropdown
        ? styles.dropdown_wrapper_active
        : styles.dropdown_wrapper;

    const dropdownItemRef = useRef<HTMLDivElement>(null);
    const clickOutsideHandler = () => {
        setShowTimeFrameDropdown(false);
    };
    useOnClickOutside(dropdownItemRef, clickOutsideHandler);

    function handleTimeFrameClickMobile(label: string, activePeriod: number) {
        handleTimeFrameButtonClick(label, activePeriod);
        setShowTimeFrameDropdown(false);
    }
    const timeFrameMobile = (
        <div className={styles.dropdown_menu} ref={dropdownItemRef}>
            <button
                className={styles.time_frame_mobile_button}
                onClick={() => setShowTimeFrameDropdown(!showTimeFrameDropdown)}
            >
                {activeTimeFrame}
            </button>

            <div className={wrapperStyle}>
                {activeTimeFrameData.map((time, idx) => (
                    <div className={styles.main_time_frame_container} key={idx}>
                        <button
                            onClick={() =>
                                handleTimeFrameClickMobile(time.label, time.activePeriod)
                            }
                            className={
                                time.label === activeTimeFrame
                                    ? styles.active_selected_button
                                    : styles.non_active_selected_button
                            }
                        >
                            {time.label}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    if (desktopView) return timeFrameMobile;

    return (
        <div className={styles.chart_overlay_container}>
            {activeTimeFrameData.map((time, idx) => (
                <div className={styles.main_time_frame_container} key={idx}>
                    <button
                        onClick={() => handleTimeFrameButtonClick(time.label, time.activePeriod)}
                        className={
                            time.label === activeTimeFrame
                                ? styles.active_selected_button
                                : styles.non_active_selected_button
                        }
                    >
                        {time.label}
                    </button>
                </div>
            ))}
        </div>
    );
}
