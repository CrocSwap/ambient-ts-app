import styles from './Range.module.css';
import RangeCardHeader from './RangeCardHeader';
import RangeCard from './RangeCard';
import { PositionIF } from '../../../../../utils/interfaces/PositionIF';

interface RangeTabPropsIF {
    positions: PositionIF[];
}

export default function Range(props: RangeTabPropsIF) {
    const { positions } = props;

    // const items = [1, 2, 3, 4, 5, 6];

    const ItemContent = positions.map((position, idx) => (
        <RangeCard key={idx} position={position} />
    ));
    return (
        <div className={styles.container}>
            <RangeCardHeader />
            {ItemContent}
        </div>
    );
}
