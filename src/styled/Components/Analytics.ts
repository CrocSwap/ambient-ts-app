import styled, { css } from 'styled-components/macro';
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
    background-color: var(--dark1);
    height: 100%;
`;

export const PoolDisplayContainer = styled.section`
    display: none;
    color: var(--text2);

    @media only screen and (min-width: 768px) {
        font-size: var(--mini-size);
        line-height: 13px;
    }

    @media only screen and (min-width: 1200px) {
        display: flex;
        font-size: var(--body-size);
        line-height: 16px;
    }
`;

export const PoolNameWrapper = styled.p`
    margin-left: 1rem;
    display: none;
    text-transform: none;

    @media (min-width: 450px) and (max-width: 640px) {
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
    font-size: var(--body-size);
    text-transform: capitalize;
    line-height: 1.5rem;
    max-height: 96px;
    overflow-y: scroll;
`;

// TableHead
export const TableHeadWrapper = styled.thead`
    background: var(--dark1);
    position: sticky;
    top: -1px;
    height: 25px;
    z-index: 1;
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
    font-size: var(--body-size);
    font-family: Arial, sans-serif;
    font-weight: 300;
    line-height: normal;
    text-transform: capitalize;
    width: 100%;
    height: 100%;
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
    display?: string;
    flexDirection?: string;
    alignItems?: string;
    justifyContent?: string;
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
    flex-direction: 
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
