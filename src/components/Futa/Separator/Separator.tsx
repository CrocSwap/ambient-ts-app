import { motion } from 'framer-motion';
import React from 'react';
import { TbTriangleFilled, TbTriangleInvertedFilled } from 'react-icons/tb';
import styles from './Separator.module.css';

interface SeparatorProps {
    horizontal?: boolean;
    dots: number;
}

const Separator: React.FC<SeparatorProps> = ({ horizontal = false, dots }) => {
    const dotElements = Array.from({ length: dots }).map((_, index) => (
        <motion.div
            key={index}
            className={styles.dot}
            initial={{ y: -20, opacity: 0 }} // Start from above and invisible
            animate={{ y: 0, opacity: 1 }} // End at the original position and fully visible
            transition={{ delay: 0.012 * index, duration: 0.1 }} // Delay each dot's animation based on its index
        ></motion.div>
    ));

    return (
        <div
            className={styles.separatorContainer}
            style={{
                flexDirection: horizontal ? 'row' : 'column',
            }}
        >
            <TbTriangleInvertedFilled
                color='42474a'
                size={8}
                style={{ pointerEvents: 'none' }}
            />
            <div className={styles.dotsContainer}>{dotElements}</div>
            <TbTriangleFilled
                color='42474a'
                size={8}
                style={{ pointerEvents: 'none' }}
            />
        </div>
    );
};

export default Separator;
