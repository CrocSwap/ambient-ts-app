import React from 'react';
import { FaPaintBrush, FaSquare } from 'react-icons/fa';
import styles from './Toolbar.module.css';
import Divider from '../../../../components/Global/Divider/Divider';
interface ToolbarProps {
    isDrawActive: boolean;
    setIsDrawActive: React.Dispatch<React.SetStateAction<boolean>>;
    activeDrawingType: string;
    setActiveDrawingType: React.Dispatch<React.SetStateAction<string>>;
}

function Toolbar(props: ToolbarProps) {
    const {
        isDrawActive,
        setIsDrawActive,
        activeDrawingType,
        setActiveDrawingType,
    } = props;

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
