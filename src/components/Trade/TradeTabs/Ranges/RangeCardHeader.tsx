import styles from './RangeCardHeader.module.css';
import { FaSort } from 'react-icons/fa';

interface RangeCardHeaderPropsIF {
    data: {
        name: string;
        sortable: boolean;
    }
}

export default function RangeCardHeader(props: RangeCardHeaderPropsIF) {
    const { data } = props;

    return (
        <div className={styles.range_column_header}>
            <h5>{data.name}</h5>
            {data.sortable && <FaSort />}
        </div>
    );
}
