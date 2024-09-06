import styles from './CurveDepth.module.css';
import {  memo } from 'react';

import { overlayIF } from '../../../../App/hooks/useChartSettings';

interface propsIF {
    overlayMethods: overlayIF;
}

function CurveDepth(props: propsIF) {
    const { overlayMethods } = props;

 

    const curveDepthData = [
        {
            readable: 'Off',
            name: 'None',
            action: () => overlayMethods.showNone(),
        },
        {
            readable: 'Curve',
            name: 'Curve',
            action: () => overlayMethods.showCurve(),
        },
        {
            readable: 'Depth',
            name: 'Depth',
            action: () => overlayMethods.showDepth(),
        },
    ];


    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'end',
                alignItems: 'end',
            }}
        >
            {curveDepthData.map((button, idx) => (
                <div className={styles.curve_depth_container} key={idx}>
                    <button
                        onClick={button.action}
                        className={
                            button.name.toLowerCase() ===
                            overlayMethods.overlay.toLowerCase()
                                ? styles.active_selected_button
                                : styles.non_active_selected_button
                        }
                        aria-label={button.name}
                    >
                        {button.readable}
                    </button>
                </div>
            ))}
        </div>
    );
}

export default memo(CurveDepth);
