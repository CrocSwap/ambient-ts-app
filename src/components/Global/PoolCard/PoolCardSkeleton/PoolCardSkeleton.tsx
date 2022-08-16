import styles from './PoolCardSkeleton.module.css';
import Shimmer from '../../Skeletons/Shimmer';

export default function PoolCardSkeleton() {
    return (
        <div className={styles.skeleton_wrapper}>
            <div className={styles.skeleton_content}>
                <div className={styles.left_side}>
                    <div className={styles.tokens}>
                        <div className={styles.token} />
                        <div className={styles.token} />
                    </div>

                    <div className={styles.amount}></div>
                </div>

                <div className={styles.right_side}>
                    <div className={styles.right_item1} />
                    <div className={styles.right_item2} />
                    <div className={styles.right_item3} />
                    <div className={styles.right_item3} />
                </div>
            </div>
            <Shimmer />
        </div>
    );
}
