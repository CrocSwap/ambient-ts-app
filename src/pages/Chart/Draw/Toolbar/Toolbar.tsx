import React from 'react';
import { FaPaintBrush } from 'react-icons/fa';
import styles from './Toolbar.module.css';
interface ToolbarProps {
    isDrawActive: boolean;
    setIsDrawActive: React.Dispatch<React.SetStateAction<boolean>>;
}

function Toolbar(props: ToolbarProps) {
    const { isDrawActive, setIsDrawActive } = props;
    function handleDrawModeChange() {
        setIsDrawActive((prev: boolean) => !prev);
    }

    const iconList = [
        {
            icon: <FaPaintBrush />,
            label: 'Brush',
        },

        // Add more icons here
    ];

    return (
        <div className={styles.icon_grid}>
            {iconList.map((item, index) => (
                <div
                    key={index}
                    className={styles.icon_card}
                    onClick={() => handleDrawModeChange()}
                >
                    {React.cloneElement(item.icon, {
                        style: {
                            fill: isDrawActive ? '#7371fc' : '#ccc',
                        },
                    })}
                    <hr style={{ marginTop: 3 }} />
                </div>
            ))}
        </div>
    );
}

export default Toolbar;
