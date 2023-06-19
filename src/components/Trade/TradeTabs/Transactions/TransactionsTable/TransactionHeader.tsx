import { Dispatch, memo, SetStateAction, useMemo } from 'react';
import { BsSortDown, BsSortUpAlt } from 'react-icons/bs';
import { IS_LOCAL_ENV } from '../../../../../constants';
import styles from '../Transactions.module.css';
import { TxSortType } from '../../useSortedTxs';

interface TransactionHeaderPropsIF {
    header: {
        name: string | JSX.Element;
        show: boolean;
        slug: string;
        sortable: boolean;
        alignRight?: boolean;
        alignCenter?: boolean;
    };

    sortBy: TxSortType;
    setSortBy: Dispatch<SetStateAction<TxSortType>>;
    reverseSort: boolean;
    setReverseSort: Dispatch<SetStateAction<boolean>>;
}
function TransactionHeader(props: TransactionHeaderPropsIF) {
    const { header, sortBy, setSortBy, reverseSort, setReverseSort } = props;
    const { name, show, slug, sortable, alignRight, alignCenter } = header;

    function handleClick(slug: TxSortType) {
        if (sortable) {
            if (sortBy !== slug) {
                IS_LOCAL_ENV && console.debug('first click');
                setSortBy(slug);
            } else if (!reverseSort) {
                IS_LOCAL_ENV && console.debug('second click');
                setReverseSort(true);
            } else if (sortBy === slug && reverseSort) {
                IS_LOCAL_ENV && console.debug('third click');
                setSortBy('default');
                setReverseSort(false);
            } else {
                console.error(
                    'Problem in click handler control flow. Refer to RangeCardHeader.tsx for troubleshooting. Resetting sort parameters to default as fallback action.',
                );
                setSortBy('default');
                setReverseSort(false);
            }
        }
    }

    const arrow = useMemo(() => {
        if (sortable) {
            if (sortBy !== slug.toLowerCase()) {
                return <BsSortDown style={{ opacity: '0' }} />;
            } else if (!reverseSort) {
                return <BsSortDown />;
            } else if (reverseSort) {
                return <BsSortUpAlt />;
            } else {
                return <BsSortDown style={{ opacity: '0' }} />;
            }
        }
    }, [sortBy, reverseSort, slug, sortable]);

    const activeSortStyle =
        sortBy === slug.toLocaleLowerCase() && sortable ? 'active_sort' : '';

    return (
        <>
            {show && (
                <li
                    style={{ cursor: sortable ? 'pointer' : 'default' }}
                    className={`${activeSortStyle} ${
                        alignRight && styles.align_right
                    } ${alignCenter && styles.align_center}`}
                    onClick={() => handleClick(slug as TxSortType)}
                >
                    {name} {arrow}
                </li>
            )}
        </>
    );
}

export default memo(TransactionHeader);
