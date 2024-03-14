import { columnSlugs, HeaderItem } from './DexTokens';
import {
    LabelWrapper,
    TableHeaderCell,
    TableHeadRow,
    TableHeadWrapper,
} from '../../../styled/Components/Analytics';

interface propsIF {
    headerItems: HeaderItem[];
    updateSort: (s: columnSlugs) => void;
}

const TableHeadTokens = (props: propsIF) => {
    const { headerItems, updateSort } = props;

    return (
        <TableHeadWrapper>
            <TableHeadRow>
                {headerItems.map((item: HeaderItem) => (
                    <TableHeaderCell
                        key={JSON.stringify(item)}
                        align={item.align}
                        sortable={item.sortable}
                        pxValue={item.pxValue}
                        responsive={item.responsive}
                        label={item.label}
                        hidden={item.hidden}
                        onClick={() => updateSort(item.slug)}
                    >
                        <LabelWrapper
                            align={item.align}
                            label={item.label}
                            sortable={item.sortable}
                        >
                            {item.label}
                        </LabelWrapper>
                    </TableHeaderCell>
                ))}
            </TableHeadRow>
        </TableHeadWrapper>
    );
};

export default TableHeadTokens;
