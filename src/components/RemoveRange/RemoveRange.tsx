import styles from './RemoveRange.module.css';
import RemoveRangeWidth from './RemoveRangeWidth/RemoveRangeWidth';
import RemoveRangeHeader from './RemoveRangeHeader/RemoveRangeHeader';
import RemoveRangeInfo from './RemoveRangeInfo/RemoveRangenfo';
import RemoveRangeButton from './RemoveRangeButton/RemoveRangeButton';

export default function RemoveRange() {
    return (
        <div className={styles.remove_Range_container}>
            <RemoveRangeHeader />
            <div className={styles.main_content}>
                <RemoveRangeWidth />
                <RemoveRangeInfo />
                <RemoveRangeButton />
            </div>
        </div>
    );
}
