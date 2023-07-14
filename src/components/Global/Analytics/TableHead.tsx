import { SortedPoolMethodsIF, sortType } from './useSortedPools';
import styled from 'styled-components';
import { BsSortDown, BsSortUpAlt } from 'react-icons/bs';
import { HeaderItem } from './TopPools';

const TableHead = ({
    headerItems,
    sortedPools,
}: {
    headerItems: HeaderItem[];
    sortedPools: SortedPoolMethodsIF;
}) => {
    const TableHeadWrapper = styled.thead`
        background: var(--dark1);
        position: sticky;
        top: 0;
        height: 25px;
        z-index: 999;
        &::before,
        &::after {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            z-index: 999;
        }

        &::before {
            top: 0;
            background-color: var(--dark1);
            height: 1px;
        }

        &::after {
            height: 1px;
            background-color: var(--dark3);
            bottom: 0;
        }
    `;

    const TableRow = styled.tr`
        font-size: 12px;
        font-family: Arial, sans-serif;
        font-weight: 300;
        line-height: normal;
        text-transform: capitalize;
        width: 100%;
        height: 100%;
    `;

    const TableHeaderCell = styled.th<HeaderItem>`
        width: 100%;
        height: 25px;

        display: table-cell;

        text-align: ${({ align }) => align};
        cursor: ${({ sortable }) => (sortable ? 'pointer' : 'default')};

        color: var(--text2);
        font-size: 12px;
        font-weight: 300;
        white-space: nowrap;
        border-collapse: collapse;
        transition: background-color 0.3s ease-in-out;

        ${({ hidden }) => hidden && 'display: none;'}

        @media (min-width: 640px) {
            ${({ responsive }) =>
                responsive === 'sm' &&
                `
            display: table-cell;
          `}
        }

        @media (min-width: 1024px) {
            ${({ responsive }) =>
                responsive === 'lg' &&
                `
            display: table-cell;
          `}
        }

        @media (min-width: 1280px) {
            ${({ responsive }) =>
                responsive === 'xl' &&
                `
            display: table-cell;
          `}
        }
    `;

    const LabelWrapper = styled.div<{
        align: string;
        label: string;
        sortable: boolean;
    }>`
        background-color: ${({ label }) =>
            sortedPools.current === label?.toLowerCase()
                ? 'var(--dark2)'
                : 'transparent'};
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: ${({ align }) => align};
        align-items: center;
        padding: 4px;

        &:hover {
            background-color: ${({ sortable }) =>
                sortable ? 'var(--dark2)' : 'transparent'};
        }
    `;

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
            <TableRow>
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
                        >
                            {item.label}
                            <AssignSort label={item.label} />
                        </LabelWrapper>
                    </TableHeaderCell>
                ))}
            </TableRow>
        </TableHeadWrapper>
    );
};

export default TableHead;
