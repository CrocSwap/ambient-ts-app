import { HeaderItem } from './TopPools';
import {
    LabelWrapper,
    TableHeaderCell,
    TableHeadRow,
    TableHeadWrapper,
} from '../../../styled/Components/Analytics';

interface propsIF {
    headerItems: HeaderItem[];
}

const TableHeadTokens = (props: propsIF) => {
    const { headerItems } = props;

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
