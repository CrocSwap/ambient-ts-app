import styles from './RangeCardHeader.module.css';
import { FaSort } from 'react-icons/fa';

interface RangeCardHeaderPropsIF {
    data: {
        name: string;
        sortable: boolean;
    }
    clickHandler: () => void;
}

export default function RangeCardHeader(props: RangeCardHeaderPropsIF) {
    const { data, clickHandler } = props;

    return (
        <div
            className={styles.range_column_header}
            onClick={clickHandler}
        >
            <h5>{data.name}</h5>
            <FaSort />
        </div>
    );
}
