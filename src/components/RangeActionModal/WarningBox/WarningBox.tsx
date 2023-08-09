import React, { useState } from 'react';
import { AiOutlineWarning } from 'react-icons/ai';
import styles from './YourStyles.module.css'; // Import your styles here
import styled, { css } from 'styled-components';

interface WarningBoxProps {
    title: string;
    details: string;
    action: () => void;
}

export const WarningBox: React.FC<WarningBoxProps> = ({
    title,
    details,
    action,
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
            <button onClick={action}>Accept</button>
        </div>
    );
};
