import React, { useContext } from 'react';
import { FaPaintBrush } from 'react-icons/fa';
import styles from './Toolbar.module.css';
import { ChartContext } from '../../../../contexts/ChartContext';
// interface ToolbarProps {
//     isDrawActive: boolean;
//     setIsDrawActive: any;
// }

function Toolbar() {
    const { setIsDrawActive } = useContext(ChartContext);

    function handleDrawModeChange() {
        setIsDrawActive((prev: boolean) => !prev);
    }

    const iconList = [
        // { icon: <FaBrush />, label: 'Star' },
        // { icon: <FaPen />, label: 'Heart' },
        {
            icon: <FaPaintBrush />,
            label: 'Smile',
        },

        // Add more icons here
    ];

    return (
        <div className={styles.icon_grid}>
            {iconList.map((item, index) => (
                <div key={index} className={styles.icon_card}>
                    <div
                        className={styles.icon}
                        onClick={() => handleDrawModeChange()}
                    >
                        {item.icon}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Toolbar;
