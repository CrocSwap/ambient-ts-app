import styles from './TimeFrame.module.css';
import {  memo } from 'react';

import { candleTimeIF } from '../../../../App/hooks/useChartSettings';

interface propsIF {
    candleTime: candleTimeIF;
}

function TimeFrame(props: propsIF) {
    const { candleTime } = props;

    return (
        <div className={styles.chart_overlay_container}>
            {candleTime.defaults.map((option, idx) => (
                <div className={styles.main_time_frame_container} key={idx}>
                    <button
                        onClick={() => candleTime.changeTime(option.seconds)}
                        className={
                            option.seconds === candleTime.time
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
