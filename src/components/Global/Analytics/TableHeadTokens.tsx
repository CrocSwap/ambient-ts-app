import { HeaderItem } from './DexTokens';
import {
    LabelWrapper,
    TableHeaderCell,
    TableHeadRow,
    TableHeadWrapper,
} from '../../../styled/Components/Analytics';
import { sortedDexTokensIF } from './useSortedDexTokens';
import AssignSort from './AssignSort';

interface propsIF {
    headerItems: HeaderItem[];
    sortedTokens: sortedDexTokensIF;
}

const TableHeadTokens = (props: propsIF) => {
    const { headerItems, sortedTokens } = props;

    return (
        <TableHeadWrapper>
            <TableHeadRow>
                {headerItems.map((item: HeaderItem) => {
                    const isActiveSort: boolean =
                        sortedTokens.sortBy.slug === item.slug;
                    return (
                        <TableHeaderCell
                            key={JSON.stringify(item)}
                            align={item.align}
                            sortable={item.sortable}
                            pxValue={item.pxValue}
                            responsive={item.responsive}
                            label={item.label}
                            hidden={item.hidden}
                            onClick={() =>
                                item.sortable && sortedTokens.update(item.slug)
                            }
                        >
                            <LabelWrapper
                                align={item.align}
                                label={item.label}
                                sortable={item.sortable}
                                currentSortedLabel={
                                    sortedTokens.sortBy.slug ?? undefined
                                }
                            >
                                {item.label}
                                {isActiveSort && (
                                    <AssignSort
                                        direction={
                                            sortedTokens.sortBy.reverse
                                                ? 'descending'
                                                : 'ascending'
                                        }
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

export default TableHeadTokens;
