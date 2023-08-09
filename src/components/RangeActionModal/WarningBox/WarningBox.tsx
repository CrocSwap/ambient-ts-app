import React from 'react';
import { AiOutlineWarning } from 'react-icons/ai';
import styles from './WarningBox.module.css'; // Import your styles here

interface WarningBoxProps {
    title: string;
    details: string;
    button: React.ReactNode;
}

export const WarningBox: React.FC<WarningBoxProps> = ({
    title,
    details,
    button,
}) => {
    return (
        <div className={` ${styles.warning_box}`}>
            <ul>
                <div>
                    <AiOutlineWarning
                        color='var(--other-red)'
                        size={20}
                        style={{ marginRight: '4px' }}
                    />
                    {title}
                </div>
                <p>{details}</p>
            </ul>
            {button}
        </div>
    );
};
