import { Dispatch, SetStateAction, useMemo } from 'react';
import { FaAngleUp, FaAngleDown } from 'react-icons/fa';
import styles from './OrderCardHeader.module.css';

interface OrderCardHeaderPropsIF {
    data: {
        name: string;
        sortable: boolean;
    };
    sortBy: string;
    setSortBy: Dispatch<SetStateAction<string>>;
    reverseSort: boolean;
    setReverseSort: Dispatch<SetStateAction<boolean>>;
}

export default function OrderCardHeader(props: OrderCardHeaderPropsIF) {
    const { data, sortBy, setSortBy, reverseSort, setReverseSort } = props;

    function handleClick(name: string) {
        console.clear();
        if (sortBy !== name) {
            console.log('first click');
            setSortBy(name);
        } else if (!reverseSort) {
            console.log('second click');
            setReverseSort(true);
        } else if (sortBy === name && reverseSort) {
            console.log('third click');
            setSortBy('default');
            setReverseSort(false);
        } else {
            console.warn(
                'Problem in click handler control flow. Refer to RangeCardHeader.tsx for troubleshooting. Resetting sort parameters to default as fallback action.',
            );
            setSortBy('default');
            setReverseSort(false);
        }
    }

    const arrowPlaceholder = (
        <div className={styles.arrow_placeholder}>
            <FaAngleDown />
        </div>
    );

    const arrow = useMemo(() => {
        if (sortBy !== data.name.toLowerCase()) {
            return arrowPlaceholder;
        } else if (!reverseSort) {
            return <FaAngleDown />;
        } else if (reverseSort) {
            return <FaAngleUp />;
        } else {
            return arrowPlaceholder;
        }
    }, [sortBy, reverseSort]);

    // TODO:   @Junior we need to make <div> wrapping the arrow icon a fixed
    // TODO:   ... width so the parent element does not resize based on whether
    // TODO:   ... or not it is being rendered

    return (
        <div
            className={styles.order_card_header}
            onClick={() => handleClick(data.name.toLowerCase())}
        >
            <p>{data.name}</p>
            <div className={styles.arrow_wrapper}>{arrow}</div>
        </div>
    );
}
