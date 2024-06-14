import React from 'react';
import styles from './Comments.module.css';

type ShimmerListProps = {
    count: number;
};

const ShimmerList: React.FC<ShimmerListProps> = ({ count }) => {
    return (
        <div className={styles.container}>
            {Array.from({ length: count }).map((_, index) => (
                <div className={styles.shimmer} key={index}></div>
            ))}
        </div>
    );
};

export default function Comments() {
    return (
        <div className={styles.mainContainer}>
            <ShimmerList count={25} />
        </div>
    );
}
