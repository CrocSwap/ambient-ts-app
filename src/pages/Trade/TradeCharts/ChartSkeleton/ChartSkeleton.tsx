import Shimmer from '../../../../components/Global/Skeletons/Shimmer';
import SkeletonElement from '../../../../components/Global/Skeletons/SkeletonElement';
import styles from './ChartSkeleton.module.css';

export default function ChartSkeleton() {
    return (
        <div className={styles.skeleton_wrapper}>
            <div className={styles.skeleton_transaction}>
                <SkeletonElement type='full' />
            </div>
            <Shimmer />
        </div>
    );
}
