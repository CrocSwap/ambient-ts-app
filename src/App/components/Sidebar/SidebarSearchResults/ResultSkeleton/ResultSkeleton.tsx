// import Shimmer from '../../../../../components/Global/Skeletons/Shimmer'
import styles from './ResultSkeleton.module.css';
export default function ResultSkeleton() {
    return (
        <div className={styles.container}>
            <div className={styles.result} />
            <div className={styles.result} />
            <div className={styles.result} />
            <div className={styles.result} />
            {/* <Shimmer/> */}
        </div>
    );
}
