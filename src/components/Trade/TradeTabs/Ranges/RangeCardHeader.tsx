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
    reverseSort: boolean;
    setReverseSort: Dispatch<SetStateAction<boolean>>;
}

export default function RangeCardHeader(props: RangeCardHeaderPropsIF) {
    const {
        data,
        sortBy,
        setSortBy,
        reverseSort,
        setReverseSort
    } = props;

    function handleClick(name: string) {
        console.clear();
        if (sortBy !== name) {
            console.log('first click');
            setSortBy(name);
        } else if (!reverseSort) {
            console.log('second click');
            setReverseSort(true);
        } else if ((sortBy === name) && reverseSort) {
            console.log('third click');
            setSortBy('default');
            setReverseSort(false);
        } else {
            console.warn('Problem in click handler control flow. Refer to RangeCardHeader.tsx for troubleshooting. Resetting sort parameters to default as fallback action.');
            setSortBy('default');
            setReverseSort(false);
        }
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
