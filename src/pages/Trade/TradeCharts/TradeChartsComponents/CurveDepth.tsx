import styles from './CurveDepth.module.css';
import { useState, useRef } from 'react';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import useOnClickOutside from '../../../../utils/hooks/useOnClickOutside';
import { overlayIF } from '../../../../App/hooks/useChartSettings';

interface propsIF {
    overlayMethods: overlayIF;
}

export default function CurveDepth(props: propsIF) {
    const { overlayMethods } = props;

    const [showCurveDepthDropdown, setShowCurveDepthDropdown] = useState(false);

    const desktopView = useMediaQuery('(max-width: 968px)');

    const curveDepthData = [
        { name: 'None', action: () => overlayMethods.showNone() },
        { name: 'Curve', action: () => overlayMethods.showCurve() },
        { name: 'Depth', action: () => overlayMethods.showDepth() },
    ];

    const wrapperStyle = showCurveDepthDropdown
        ? styles.dropdown_wrapper_active
        : styles.dropdown_wrapper;

    const dropdownItemRef = useRef<HTMLDivElement>(null);
    const clickOutsideHandler = () => {
        setShowCurveDepthDropdown(false);
    };
    useOnClickOutside(dropdownItemRef, clickOutsideHandler);

    function handleCurveDepthClickMobile(action: () => void) {
        action();
        setShowCurveDepthDropdown(false);
    }

    const curveDepthMobile = (
        <div className={styles.dropdown_menu} ref={dropdownItemRef}>
            <button
                className={styles.curve_depth_mobile_button}
                onClick={() =>
                    setShowCurveDepthDropdown(!showCurveDepthDropdown)
                }
            >
                {overlayMethods.overlay}
            </button>

            <div className={wrapperStyle}>
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
                        >
                            {button.name}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
    if (desktopView) return curveDepthMobile;

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
                    >
                        {button.name}
                    </button>
                </div>
            ))}
        </div>
    );
}
