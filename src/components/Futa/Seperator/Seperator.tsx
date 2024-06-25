import React from 'react';
import styles from './Seperator.module.css';
import { TbTriangleInvertedFilled, TbTriangleFilled } from 'react-icons/tb';

interface SeperatorProps {
    horizontal?: boolean;
    dots: number;
}

const Seperator: React.FC<SeperatorProps> = ({ horizontal = false, dots }) => {
    const dotElements = Array.from({ length: dots }).map((_, index) => (
        <div key={index} className={styles.dot}></div>
    ));

    return (
        <div
            className={styles.separatorContainer}
            style={{
                flexDirection: horizontal ? 'row' : 'column',
            }}
        >
            <TbTriangleInvertedFilled color='42474a' size={8} />
            <div className={styles.dotsContainer}>{dotElements}</div>
            <TbTriangleFilled color='42474a' size={8} />
        </div>
    );
};

export default Seperator;
