import RemoveRangeHeader from '../RemoveRange/RemoveRangeHeader/RemoveRangeHeader';
import styles from './RangeDetails.module.css';

export default function RangeDetails() {
    return (
        <div className={styles.remove_Range_container}>
            <RemoveRangeHeader />
            <div className={styles.main_content}></div>
        </div>
    );
}
