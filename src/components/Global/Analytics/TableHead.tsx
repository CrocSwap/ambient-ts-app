import { SortedPoolMethodsIF, sortType } from './useSortedPools';
import { BsSortDown, BsSortUpAlt } from 'react-icons/bs';
import { HeaderItem } from './TopPools';
import {
    LabelWrapper,
    TableHeaderCell,
    TableHeadRow,
    TableHeadWrapper,
} from '../../../styled/Components/Analytics';

const TableHead = ({
    headerItems,
    sortedPools,
}: {
    headerItems: HeaderItem[];
    sortedPools: SortedPoolMethodsIF;
}) => {
    const AssignSort: React.FC<{ label: string }> = ({ label }) => {
        const isCurrentSort = sortedPools.current === label.toLowerCase();
        const sortedArrow =
            sortedPools.direction === 'ascending' ? (
                <BsSortDown />
            ) : (
                <BsSortUpAlt />
            );
        const showArrow = isCurrentSort ? sortedArrow : null;

        return showArrow;
    };

    return (
        <TableHeadWrapper>
            <TableHeadRow>
                {headerItems.map((item, index) => (
                    <TableHeaderCell
                        key={index}
                        align={item.align}
                        sortable={item.sortable}
                        pxValue={item.pxValue}
                        responsive={item.responsive}
                        label={item.label}
                        hidden={item.hidden}
                        onClick={() => {
                            item.sortable &&
                                sortedPools.updateSort(
                                    (item.label
                                        ? item.label.toLowerCase()
                                        : '') as sortType,
                                );
                        }}
                    >
                        <LabelWrapper
                            align={item.align}
                            label={item.label}
                            sortable={item.sortable}
                            currentSortedLabel={
                                sortedPools.current ?? undefined
                            }
                        >
                            {item.label}
                            <AssignSort label={item.label} />
                        </LabelWrapper>
                    </TableHeaderCell>
                ))}
            </TableHeadRow>
        </TableHeadWrapper>
    );
};

export default TableHead;
