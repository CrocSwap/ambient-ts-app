import styles from './CurveDepth.module.css';
import { SetStateAction, useState, useRef } from 'react';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import useOnClickOutside from '../../../../utils/hooks/useOnClickOutside';

interface CurveDepthPropsIF {
    setLiqMode: (value: SetStateAction<string>) => void;
    liqMode: string;
}
export default function CurveDepth(props: CurveDepthPropsIF) {
    const { setLiqMode, liqMode } = props;

    const [showCurveDepthDropdown, setShowCurveDepthDropdown] = useState(false);

    const desktopView = useMediaQuery('(max-width: 968px)');

    const handleLiqToggle = (mode: string) =>
        setLiqMode(() => {
            return mode;
        });

    const curveDepthData = [
        { name: 'Off', action: () => handleLiqToggle('Off') },
        { name: 'Curve', action: () => handleLiqToggle('Curve') },
        { name: 'Depth', action: () => handleLiqToggle('Depth') },
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
                onClick={() => setShowCurveDepthDropdown(!showCurveDepthDropdown)}
            >
                {liqMode}
            </button>

            <div className={wrapperStyle}>
                {curveDepthData.map((button, idx) => (
                    <div className={styles.curve_depth_container} key={idx}>
                        <button
                            onClick={() => handleCurveDepthClickMobile(button.action)}
                            className={
                                button.name.toLowerCase() === liqMode.toLowerCase()
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
                            button.name.toLowerCase() === liqMode.toLowerCase()
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
