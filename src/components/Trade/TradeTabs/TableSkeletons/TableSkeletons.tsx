import Shimmer from '../../../Global/Skeletons/Shimmer';
import SkeletonElement from '../../../Global/Skeletons/SkeletonElement';
import styles from './TableSkeletons.module.css';

export default function TableSkeletons() {
    return (
        <div className={styles.skeleton_wrapper}>
            <div className={styles.skeleton_transaction}>
                <SkeletonElement type='text' />
                <SkeletonElement type='text' />
                <SkeletonElement type='text' />
                <SkeletonElement type='text' />
                <SkeletonElement type='text' />
            </div>
            <Shimmer />
        </div>
    );
}
