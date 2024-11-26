import { motion } from 'framer-motion';
import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
    fillPercentage: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ fillPercentage }) => {
    // Calculate the number of filled bars
    const filledBars = fillPercentage / 10;

    // console.log({ fillPercentage });
    // console.log({ filledBars });

    return (
        <div className={styles.progressBarContainer}>
            {Array.from({ length: 10 }, (_, idx) => (
                <motion.span
                    key={idx}
                    className={`${styles.progressBar} ${idx < filledBars ? styles.filled : ''}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: idx < filledBars ? 1 : 0.3 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                />
            ))}
        </div>
    );
};

export default ProgressBar;
