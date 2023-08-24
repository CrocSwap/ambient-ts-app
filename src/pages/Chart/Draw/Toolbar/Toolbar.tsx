import React, { useContext } from 'react';
import { FaPaintBrush, FaSquare } from 'react-icons/fa';
import styles from './Toolbar.module.css';
import { ChartContext } from '../../../../contexts/ChartContext';
// interface ToolbarProps {
//     isDrawActive: boolean;
//     setIsDrawActive: any;
// }

function Toolbar() {
    const { isDrawActive, setIsDrawActive } = useContext(ChartContext);

    function handleDrawModeChange() {
        setIsDrawActive((prev: boolean) => !prev);
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
                        onClick={() => handleDrawModeChange()}
                    >
                        {React.cloneElement(item.icon, {
                            style: {
                                fill: isDrawActive ? '#7371fc' : '#ccc',
                            },
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Toolbar;
