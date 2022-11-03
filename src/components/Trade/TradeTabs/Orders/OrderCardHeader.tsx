// todo: SEE RETURN STATEMENT

import { Dispatch, SetStateAction, useMemo } from 'react';
import { FaAngleUp, FaAngleDown } from 'react-icons/fa';
import styles from './OrderCardHeader.module.css';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';

type ColumnData = {
    name: string;
    sortable: boolean;
    className: string;
};

interface OrderCardHeaderWithSortPropsIF {
    data: {
        name: string;
        sortable: boolean;
        className: string;
    };
    sortBy: string;
    reverseSort: boolean;
}
interface OrderCardHeaderPropsIF {
    // data: {
    //     name: string;
    //     sortable: boolean;
    //     className: string;
    // };

    sortBy: string;
    setSortBy: Dispatch<SetStateAction<string>>;
    reverseSort: boolean;
    setReverseSort: Dispatch<SetStateAction<boolean>>;

    columnHeaders: ColumnData[];
}

export default function OrderCardHeader(props: OrderCardHeaderPropsIF) {
    const tradeData = useAppSelector((state) => state.tradeData);
    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;
    const {
        // data,

        sortBy,
        setSortBy,
        reverseSort,
        setReverseSort,
        columnHeaders,
    } = props;

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

    function OrderCardHeaderWithSort(props: OrderCardHeaderWithSortPropsIF) {
        const { data, sortBy, reverseSort } = props;

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
                <OrderCardHeaderWithSort
                    key={`orderDataHeaderField${header.name}`}
                    data={header}
                    sortBy={sortBy}
                    reverseSort={reverseSort}
                />
            ))}
        </>
    );

    const mobileHeaderDisplay = (
        <div className={styles.mobile_header_display}>
            <div className={styles.mobile_header_content}>
                <p>ID/Wallet</p>
                <p>Price</p>
                <p>Type</p>
                <p>Side</p>
                <p>Value</p>
                <p>{quoteTokenSymbol}</p>
                <p>{baseTokenSymbol}</p>
                <p>Status</p>
            </div>
            <div />
        </div>
    );
    return (
        // <>
        //     {mobileHeaderDisplay}
        //     <div className={styles.main_container}>
        //         <div className={styles.row_container}>{columnHeaderContent}</div>
        //         <div></div>
        //     </div>
        // </>
        <p>
            This file has been refactored and updated to OrderHeader.tsx on 10/13/2022. It is no
            longer in use. If not uncommented by 12/13/2022, it can be safely deleted, along with
            OrderCardHeader.module.css. -Jr
        </p>
    );
}
