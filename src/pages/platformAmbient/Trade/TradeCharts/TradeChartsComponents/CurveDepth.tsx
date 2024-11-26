import { memo } from 'react';
import { overlayIF } from '../../../../../App/hooks/useChartSettings';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import styles from './CurveDepth.module.css';

interface propsIF {
    overlayMethods: overlayIF;
}

function CurveDepth(props: propsIF) {
    const { overlayMethods } = props;

    const mobileView = useMediaQuery('(max-width: 768px)');

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

    function handleCurveDepthClickMobile(action: () => void) {
        action();
    }

    const curveDepthMobile = (
        <div className={styles.mobile_container}>
            {curveDepthData.map((button, idx) => (
                <div className={styles.curve_depth_container} key={idx}>
                    <button
                        onClick={() =>
                            handleCurveDepthClickMobile(button.action)
                        }
                        className={
                            button.name.toLowerCase() ===
                            overlayMethods.overlay.toLowerCase()
                                ? styles.active_selected_button
                                : styles.non_active_selected_button
                        }
                        aria-label={button.name}
                    >
                        {button.name}
                    </button>
                </div>
            ))}
        </div>
    );
    if (mobileView) return curveDepthMobile;

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
