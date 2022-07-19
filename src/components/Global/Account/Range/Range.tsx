import styles from './Range.module.css';
import RangeCardHeader from './RangeCardHeader';
import RangeCard from './RangeCard';
export default function Range() {
    const items = [1, 2, 3, 4, 5, 6];

    const ItemContent = items.map((item, idx) => <RangeCard key={idx} />);
    return (
        <div className={styles.container}>
            <RangeCardHeader />
            {ItemContent}
        </div>
    );
}
