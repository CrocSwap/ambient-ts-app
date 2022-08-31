import { Dispatch, SetStateAction } from 'react';
import styles from './RangeCardHeader.module.css';
import { FaSort } from 'react-icons/fa';

interface RangeCardHeaderPropsIF {
    data: {
        name: string;
        sortable: boolean;
    }
    setSortBy: Dispatch<SetStateAction<string>>
}

export default function RangeCardHeader(props: RangeCardHeaderPropsIF) {
    const {
        data,
        setSortBy
    } = props;

    function handleClick() {
        setSortBy(data.name.toLowerCase());
    }

    return (
        <div
            className={styles.range_column_header}
            onClick={() => handleClick()}
        >
            <h5>{data.name}</h5>
            <FaSort />
        </div>
    );
}
