import { Dispatch, SetStateAction } from 'react';
import styles from './RangeCardHeader.module.css';
import { FaSort } from 'react-icons/fa';

interface RangeCardHeaderPropsIF {
    data: {
        name: string;
        sortable: boolean;
    };
    sortBy: string;
    setSortBy: Dispatch<SetStateAction<string>>;
}

export default function RangeCardHeader(props: RangeCardHeaderPropsIF) {
    const {
        data,
        sortBy,
        setSortBy
    } = props;

    function handleClick(name: string) {
        sortBy === name
            ? null
            : setSortBy(name);
    }

    return (
        <div
            className={styles.range_column_header}
            onClick={() => handleClick(data.name.toLowerCase())}
        >
            <h5>{data.name}</h5>
            <FaSort />
        </div>
    );
}
