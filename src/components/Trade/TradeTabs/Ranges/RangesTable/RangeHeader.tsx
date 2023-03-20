import { Dispatch, SetStateAction, useMemo } from 'react';
import { BsSortDown, BsSortUpAlt } from 'react-icons/bs';
import styles from '../Ranges.module.css';
interface RangeHeaderPropsIF {
    header: {
        name: string | JSX.Element;
        // className: string;
        show: boolean;
        slug: string;
        sortable: boolean;
        alignRight?: boolean;
        alignCenter?: boolean;
    };

    sortBy: string;
    setSortBy: Dispatch<SetStateAction<string>>;
    reverseSort: boolean;
    setReverseSort: Dispatch<SetStateAction<boolean>>;
}
export default function RangeHeader(props: RangeHeaderPropsIF) {
    const { header, sortBy, setSortBy, reverseSort, setReverseSort } = props;
    const { name, show, slug, sortable, alignRight, alignCenter } = header;

    function handleClick(slug: string) {
        console.clear();
        console.log(slug);
        // prevent action when user clicks a column which is not sortable
        if (!header.sortable) return;
        // determine which sort should be used
        // accounts for the column clicked and mutliple clicks
        if (sortBy !== slug) {
            console.log('first click');
            setSortBy(slug);
        } else if (!reverseSort) {
            console.log('second click');
            setReverseSort(true);
        } else if (sortBy === slug && reverseSort) {
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

    const activeSortStyle = sortBy === slug.toLocaleLowerCase() && sortable ? 'active_sort' : '';

    return (
        <>
            {show && (
                <li
                    style={{ cursor: sortable ? 'pointer' : 'default' }}
                    onClick={() => handleClick(slug.toLowerCase())}
                    className={`
                    ${activeSortStyle} 
                    ${alignRight && styles.align_right} 
                    ${alignCenter && styles.align_center}
                   
                    
                    `}
                >
                    {name} {arrow}
                </li>
            )}
        </>
    );
}
