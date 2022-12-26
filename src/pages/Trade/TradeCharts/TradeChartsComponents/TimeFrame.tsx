import styles from './TimeFrame.module.css';
import { Dispatch, SetStateAction } from 'react';

interface TimeFramePropsIF {
    activeTimeFrame: string;
    setActiveTimeFrame: Dispatch<SetStateAction<string>>;
    setActivePeriod: (period: number) => void;
}
export default function TimeFrame(props: TimeFramePropsIF) {
    const { setActiveTimeFrame, setActivePeriod, activeTimeFrame } = props;
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
