import React from 'react';
import styles from './WarningBox.module.css'; // Import your styles here
import { IoWarningOutline } from 'react-icons/io5';

interface WarningBoxProps {
    title: string;
    details: string;
    button?: React.ReactNode;
    noBackground?: boolean;
}

export const WarningBox: React.FC<WarningBoxProps> = ({
    title,
    details,
    button,
    noBackground,
}) => {
    const noBackgroundWarning = (
        <div className={styles.text_only}>
            <div>
                <IoWarningOutline color='var(--other-red)' size={24} />
            </div>
            <p>{details}</p>
            {button && button}
        </div>
    );

    if (noBackground) return noBackgroundWarning;
    return (
        <div className={` ${styles.warning_box}`}>
            <ul>
                <div>
                    <IoWarningOutline
                        color='var(--other-red)'
                        size={20}
                        style={{ marginRight: '4px' }}
                    />
                    {title}
                </div>
                <p>{details}</p>
            </ul>
            {button && button}
        </div>
    );
};
