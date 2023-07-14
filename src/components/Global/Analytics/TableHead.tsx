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
        width: 100%;
        height: 100%;
    `;

    const TableHeaderCell = styled.th<HeaderItem>`
        position: sticky;
        top: 0;
        width: 100%;
        height: 25px;
        padding: 0 4px;

        text-align: ${({ align }) => align};

        cursor: ${({ sortable }) => (sortable ? 'pointer' : 'default')};

        background-color: ${({ label }) =>
            sortedPools.current === label?.toLowerCase()
                ? 'var(--dark2)'
                : 'transparent'};
        color: var(--text2);
        font-size: 12px;
        font-weight: 300;
        white-space: nowrap;
        border-collapse: collapse;
        transition: background-color 0.3s ease-in-out;
        &:first-of-type {
            border-left: 1rem solid transparent;
        }
        &:last-of-type {
            border-right: 1rem solid transparent;
        }

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

    const AssignSort: React.FC<{ label: string }> = ({ label }) => {
        const isCurrentSort = sortedPools.current === label.toLowerCase();
        const sortedArrow =
            sortedPools.direction === 'ascending' ? (
                <BsSortUpAlt />
            ) : (
                <BsSortDown />
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
                        <div
                            style={{
                                background:
                                    sortedPools.current ===
                                    item.label.toLowerCase()
                                        ? 'var(--dark2)'
                                        : 'transparent',
                                width: '100%',
                                height: '100%',
                            }}
                        >
                            {item.label}

                            <AssignSort label={item.label} />
                        </div>
                    </TableHeaderCell>
                ))}
            </TableRow>
        </TableHeadWrapper>
    );
};

export default TableHead;
