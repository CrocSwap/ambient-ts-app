import { MouseEventHandler } from 'react';
import { SortedPoolMethodsIF, sortType } from './useSortedPools';
import styled from 'styled-components';

type HeaderItem = {
    label: string;
    hidden: boolean;
    align: string;
    responsive?: string;
    sortable: boolean;
    pxValue?: number;
    onClick?: MouseEventHandler<HTMLTableCellElement> | undefined;
};
const TableHead = ({
    headerItems,
    sortedPools,
}: {
    headerItems: HeaderItem[];
    sortedPools: SortedPoolMethodsIF;
}) => {
    const TableHeadWrapper = styled.thead`
        position: sticky;
        top: 0;
        height: 25px;
        z-index: 3;
        border-bottom: 1px solid var(--dark3);
    `;

    const TableRow = styled.tr`
        font-size: 12px;
        font-family: Arial, sans-serif;
        font-weight: 300;
        line-height: normal;
        text-transform: capitalize;
    `;

    const TableHeaderCell = styled.th<HeaderItem>`
        position: sticky;
        top: 0;
        text-align: ${({ align }) => align};
        padding: ${({ pxValue }) => (pxValue ? `0 ${pxValue}px` : '0 6px')};
        cursor: ${({ sortable }) => (sortable ? 'pointer' : 'default')};
        background-color: ${({ label }) =>
            sortedPools.current === label.toLowerCase()
                ? 'var(--dark2)'
                : 'transparent'};
        color: var(--text2);
        font-size: 12px;
        font-weight: 300;
        white-space: nowrap;
        border-collapse: collapse;
        transition: background-color 0.3s ease-in-out;

        &:hover {
            background-color: ${({ sortable }) =>
                sortable ? 'var(--dark2)' : 'transparent'};
        }

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
                                    item.label.toLowerCase() as sortType,
                                );
                        }}
                    >
                        {item.label}
                    </TableHeaderCell>
                ))}
            </TableRow>
        </TableHeadWrapper>
    );
};

export default TableHead;
