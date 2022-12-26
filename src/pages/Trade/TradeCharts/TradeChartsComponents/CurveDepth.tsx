import styles from './CurveDepth.module.css';
import { SetStateAction } from 'react';

interface CurveDepthPropsIF {
    setLiqMode: (value: SetStateAction<string>) => void;
    liqMode: string;
}
export default function CurveDepth(props: CurveDepthPropsIF) {
    const { setLiqMode, liqMode } = props;

    const handleLiqToggle = (mode: string) =>
        setLiqMode(() => {
            return mode;
        });

    const curveDepthData = [
        { name: 'Off', action: () => handleLiqToggle('Off') },
        { name: 'Curve', action: () => handleLiqToggle('Curve') },
        { name: 'Depth', action: () => handleLiqToggle('Depth') },
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
