import React, { useContext } from 'react';
import { FaPaintBrush, FaSquare } from 'react-icons/fa';
import styles from './Toolbar.module.css';
import { ChartContext } from '../../../../contexts/ChartContext';
// interface ToolbarProps {
//     isDrawActive: boolean;
//     setIsDrawActive: any;
// }

function Toolbar() {
    const {
        isDrawActive,
        setIsDrawActive,
        activeDrawingType,
        setActiveDrawingType,
    } = useContext(ChartContext);

    function handleDrawModeChange(item: any) {
        setIsDrawActive((prev: boolean) => !prev);
        setActiveDrawingType(item.label);
    }

    const iconList = [
        {
            icon: <FaPaintBrush />,
            label: 'Brush',
        },
        {
            icon: <FaSquare />,
            label: 'Square',
        },

        // Add more icons here
    ];

    return (
        <div className={styles.icon_grid}>
            {iconList.map((item, index) => (
                <div key={index} className={styles.icon_card}>
                    <div
                        className={
                            isDrawActive
                                ? styles.icon_active
                                : styles.icon_inactive
                        }
                        onClick={() => handleDrawModeChange(item)}
                    >
                        {React.cloneElement(item.icon, {
                            style: {
                                fill:
                                    isDrawActive &&
                                    activeDrawingType === item.label
                                        ? '#7371fc'
                                        : '#ccc',
                            },
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Toolbar;
