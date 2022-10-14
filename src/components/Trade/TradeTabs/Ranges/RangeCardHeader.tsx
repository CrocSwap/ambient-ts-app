// todo: SEE RETURN STATEMENT

import { Dispatch, SetStateAction, useMemo } from 'react';
import styles from './RangeCardHeader.module.css';
import { FaAngleUp, FaAngleDown } from 'react-icons/fa';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';

type ColumnData = {
    name: string;
    sortable: boolean;
    className: string;
};

interface RangeCardHeaderWithSortPropsIF {
    data: {
        name: string;
        sortable: boolean;
        className: string;
    };
    sortBy: string;
    reverseSort: boolean;
}

interface RangeCardHeaderPropsIF {
    // data: {
    //     name: string;
    //     sortable: boolean;
    // };
    sortBy: string;
    setSortBy: Dispatch<SetStateAction<string>>;
    reverseSort: boolean;
    setReverseSort: Dispatch<SetStateAction<boolean>>;

    columnHeaders: ColumnData[];
}

export default function RangeCardHeader(props: RangeCardHeaderPropsIF) {
    const { sortBy, setSortBy, reverseSort, setReverseSort, columnHeaders } = props;
    const tradeData = useAppSelector((state) => state.tradeData);
    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

    function handleClick(name: string) {
        const resetSearch = () => {
            setSortBy('default');
            setReverseSort(true);
        };
        if (sortBy !== name) {
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
    const arrowPlaceholder = (
        <div className={styles.arrow_placeholder}>
            <FaAngleDown />
        </div>
    );

    function RangeCardHeaderWithSort(props: RangeCardHeaderWithSortPropsIF) {
        const { data, sortBy, reverseSort } = props;

        const arrow = useMemo(() => {
            if (!data.sortable) {
                return arrowPlaceholder;
            } else if (sortBy !== data.name.toLowerCase()) {
                return arrowPlaceholder;
            } else if (!reverseSort) {
                return <FaAngleDown />;
            } else if (reverseSort) {
                return <FaAngleUp />;
            } else {
                return arrowPlaceholder;
            }
        }, [sortBy, reverseSort]);

        return (
            <section
                onClick={() => handleClick(data.name.toLowerCase())}
                className={`${styles.sortable_container} ${styles[data.className]}`}
            >
                <p>{data.name}</p>
                <div className={styles.arrow_wrapper}>{arrow}</div>
            </section>
        );
    }

    const columnHeaderContent = (
        <>
            {columnHeaders.map((header) => (
                <RangeCardHeaderWithSort
                    key={`rangeDataHeaderField${header.name}`}
                    data={header}
                    sortBy={sortBy}
                    reverseSort={reverseSort}
                />
            ))}
        </>
    );

    // const arrow = useMemo(() => {
    //     if (!data.sortable) {
    //         return null;
    //     } else if (sortBy !== data.name.toLowerCase()) {
    //         return null;
    //     } else if (!reverseSort) {
    //         return <FaAngleDown />;
    //     } else if (reverseSort) {
    //         return <FaAngleUp />;
    //     } else {
    //         return null;
    //     }
    // }, [sortBy, reverseSort]);

    // TODO:   @Junior we need to make <div> wrapping the arrow icon a fixed
    // TODO:   ... width so the parent element does not resize based on whether
    // TODO:   ... or not it is being rendered
    const mobileHeaderDisplay = (
        <div className={styles.mobile_header_display}>
            <div className={styles.mobile_header_content}>
                <p>ID/Wallet</p>
                <p>{baseTokenSymbol}</p>
                <p>{quoteTokenSymbol}</p>
                <p>Value</p>
                <p>Min</p>
                <p>Max</p>
                <p>APR</p>
                <p>Status</p>
            </div>
            <div />
        </div>
    );

    return (
        // <div
        //     className={styles.range_column_header}
        //     onClick={() => handleClick(data.name.toLowerCase())}
        // >

        //     <h5>{data.name}</h5>
        //     <div className={styles.arrow_wrapper}>{arrow}</div>
        // </div>
        <>
            {/* {mobileHeaderDisplay}
            <div className={styles.main_container}>
                <div className={styles.row_container}>{columnHeaderContent}</div>
                <div />
            </div> */}
            <p>
                This file has been refactored and updated to RangeHeader.tsx on 10/13/2022. It is no
                longer in use. If not uncommented by 12/13/2022, it can be safely deleted, along
                with RangeCardHeader.module.css. -Jr
            </p>
        </>
    );
}
