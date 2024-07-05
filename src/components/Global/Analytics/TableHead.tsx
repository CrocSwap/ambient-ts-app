import { SortedPoolMethodsIF, sortType } from './useSortedPools';
import { HeaderItem } from './TopPools';
import {
    LabelWrapper,
    TableHeaderCell,
    TableHeadRow,
    TableHeadWrapper,
} from '../../../styled/Components/Analytics';
import AssignSort from './AssignSort';

interface propsIF {
    headerItems: HeaderItem[];
    sortedPools: SortedPoolMethodsIF;
}

const TableHead = (props: propsIF) => {
    const { headerItems, sortedPools } = props;

    return (
        <TableHeadWrapper>
            <TableHeadRow>
                {headerItems.map((item: HeaderItem) => {
                    const isActiveSort: boolean =
                        sortedPools.current === item.label.toLowerCase();
                    return (
                        <TableHeaderCell
                            key={JSON.stringify(item)}
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
                                {isActiveSort && (
                                    <AssignSort
                                        direction={sortedPools.direction}
                                    />
                                )}
                            </LabelWrapper>
                        </TableHeaderCell>
                    );
                })}
            </TableHeadRow>
        </TableHeadWrapper>
    );
};

export default TableHead;
