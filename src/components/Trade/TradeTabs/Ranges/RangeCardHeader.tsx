import { Dispatch, SetStateAction, useMemo } from 'react';
import styles from './RangeCardHeader.module.css';
import { FaAngleUp, FaAngleDown } from 'react-icons/fa';

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
    const { data, sortBy, setSortBy, reverseSort, setReverseSort } = props;

    function handleClick(name: string) {
        const resetSearch = () => {
            setSortBy('default');
            setReverseSort(true);
        };
        if (!data.sortable) {
            resetSearch();
        } else if (sortBy !== name) {
            console.log('first click');
            setSortBy(name);
            setReverseSort(false);
        } else if (!reverseSort) {
            console.log('second click');
            setReverseSort(true);
        } else if (sortBy === name && reverseSort) {
            resetSearch();
        } else {
            console.warn(
                'Problem in click handler control flow. Refer to RangeCardHeader.tsx for troubleshooting. Resetting sort parameters to default as fallback action.',
            );
            resetSearch();
        }
    }

    const arrow = useMemo(() => {
        if (!data.sortable) {
            return null;
        } else if (sortBy !== data.name.toLowerCase()) {
            return null;
        } else if (!reverseSort) {
            return <FaAngleDown />;
        } else if (reverseSort) {
            return <FaAngleUp />;
        } else {
            return null;
        }
    }, [sortBy, reverseSort]);

    // TODO:   @Junior we need to make <div> wrapping the arrow icon a fixed
    // TODO:   ... width so the parent element does not resize based on whether
    // TODO:   ... or not it is being rendered

    return (
        <div
            className={styles.range_column_header}
            onClick={() => handleClick(data.name.toLowerCase())}
        >
            <h5>{data.name}</h5>
            <div className={styles.arrow_wrapper}>{arrow}</div>
        </div>
    );
}
