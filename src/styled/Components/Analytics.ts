import styled, { css } from 'styled-components/macro';
import { HeaderItem } from '../../components/Global/Analytics/TopPools';
import { FlexContainer } from '../Common';

export const ScrollableContainer = styled.div`
    position: relative;
    flex-grow: 1;
    overflow-y: auto;
    height: 100%;
    scrollbar-width: thin;
    scrollbar-color: var(--dark3) var(--dark1);
    background: var(--dark1);

    &::-webkit-scrollbar {
        display: 'none';
    }

    &::-webkit-scrollbar-track {
        background-color: var(--dark1);
    }

    &::-webkit-scrollbar-thumb {
        background-color: var(--dark3);
    }
`;

export const ShadowBox = styled.div`
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-radius: 0.375rem;
    background-color: var(--dark1);
    height: 100%;

    padding: 0 1rem;
`;

export const PoolDisplayContainer = styled.section`
    display: none;
    color: var(--text2);

    @media only screen and (min-width: 768px) {
        font-size: 10px;
        line-height: 13px;
    }

    @media only screen and (min-width: 1200px) {
        display: flex;
        font-size: 12px;
        line-height: 16px;
    }
`;

export const PoolNameWrapper = styled.p`
    margin-left: 1rem;
    display: none;

    @media (min-width: 400px) and (max-width: 640px) {
        display: flex;
    }
`;

export const Table = styled.table`
    border-collapse: collapse;
    width: 100%;
    table-layout: fixed;

    @media only screen and (min-width: 1280px) {
        td,
        th {
            min-width: 180px;
        }
    }
`;

export const TableBody = styled.tbody`
    background-color: var(--dark1);
    color: var(--white);
    font-size: 12px;
    text-transform: capitalize;
    line-height: 1.5rem;
    max-height: 96px;
    overflow-y: scroll;
`;

// TableHead
export const TableHeadWrapper = styled.thead`
    background: var(--dark1);
    position: sticky;
    top: 0;
    height: 25px;
    z-index: 3;
    &::before,
    &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        z-index: 5;
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
    user-select: none;
`;
export const TableHeadRow = styled.tr`
    font-size: 12px;
    font-family: Arial, sans-serif;
    font-weight: 300;
    line-height: normal;
    text-transform: capitalize;
    width: 100%;
    height: 100%;
`;

export const TableHeaderCell = styled.th<HeaderItem>`
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

interface LabelWrapperProps {
    align: string;
    label: string;
    sortable: boolean;
    currentSortedLabel?: string;
}

export const LabelWrapper = styled.div<LabelWrapperProps>`
    background-color: ${({ label, currentSortedLabel }) =>
        currentSortedLabel === label?.toLowerCase()
            ? 'var(--dark2)'
            : 'transparent'};
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: ${({ align }) => align};
    align-items: center;
    padding: 4px;
    gap: 4px;

    &:hover {
        background-color: ${({ sortable }) =>
            sortable ? 'var(--dark2)' : 'transparent'};
    }
`;

export const TableRow = styled.tr`
    height: 40px;
    cursor: pointer;
    margin-bottom: 2px;
  
    &:hover {
        background-color: var(--dark2);
    }
    position: relative;
 ]
`;

interface TableCellProps {
    hidden?: boolean;
    sm?: boolean;
    lg?: boolean;
    xl?: boolean;
    left?: boolean;
}
// TODO: make these app-wide
const media = {
    sm: '(min-width: 640px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
};
// Styles for media queries
const mediaStyles = {
    sm: css`
        @media ${media.sm} {
            display: table-cell;
        }
    `,
    lg: css`
        @media ${media.lg} {
            display: table-cell;
        }
    `,
    xl: css`
        @media ${media.xl} {
            display: table-cell;
        }
    `,
};
export const TableCell = styled.td<TableCellProps>`
    white-space: nowrap;
    color: var(--text1);

    text-align: ${({ left }) => (left ? 'left' : 'right')};

    ${({ hidden }) =>
        hidden &&
        css`
            display: none;
        `}

    ${({ sm }) => sm && mediaStyles.sm}
    ${({ lg }) => lg && mediaStyles.lg}
    ${({ xl }) => xl && mediaStyles.xl}
`;

export const TradeButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--dark1);
    border: 1px solid var(--dark3);
    border-radius: 999px;
    cursor: pointer;
    width: 48px;
    height: 25px;
    color: var(--text1);

    &:hover {
        color: var(--accent1);
        border-color: var(--accent1);
    }
`;

export const SpinnerContainer = styled(FlexContainer)`
    position: absolute;
    top: 0;
    left: 0;
`;
