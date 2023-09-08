import { motion } from 'framer-motion';
import { AiOutlineHeart } from 'react-icons/ai';
import { BiSearch } from 'react-icons/bi';
import { GiBackwardTime, GiSaveArrow } from 'react-icons/gi';
import { LuDroplets, LuFileClock } from 'react-icons/lu';
import { MdOutlineExpand, MdPlayArrow } from 'react-icons/md';
import styled, { css } from 'styled-components/macro';
import { FlexContainer, GridContainer } from '../Common';

export const SidebarDiv = styled.div<{ open: boolean }>`
    background-color: var(--dark1);
    transition: all var(--animation-speed) ease-in-out;

    overflow: hidden;
    padding: 4px;
    z-index: 9999;

    width: ${({ open }) => (open ? '296px' : '32px')};
    height: calc(100vh - 56px);
    border-top: 1px solid var(--dark2);

    cursor: ${({ open }) => (open ? 'default' : 'pointer')};

    &::-webkit-scrollbar {
        width: 0.25rem;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background: transparent;
    }

    @media only screen and (max-width: 1279px) {
        position: fixed;
        top: 56px;
        left: 0;
        box-shadow: ${({ open }) =>
            open ? '20px 20px 65px #0b0e13, -20px -20px 65px #0f141b' : 'none'};
    }
`;

export const ContentContainer = styled(FlexContainer)`
    width: 100%;
    flex: 1;
    overflow: hidden;

    @media only screen and (max-width: 600px) {
        overflow: auto;
    }
`;

export const SearchContainer = styled(FlexContainer)`
    background-color: var(--dark2);
    border-radius: var(--border-radius);
`;

export const SearchInput = styled.input`
    width: 100%;
    padding: 0 1rem;

    background: transparent;
    color: var(--text1);
    outline: none;
    border: none;
    opacity: 1;
    transition: all var(--animation-speed) ease-in;
    cursor: normal;

    &:-webkit-autofill {
        background: black;
    }
`;

export const HeaderGrid = styled(GridContainer)`
    border-bottom: 1px solid var(--dark2);
`;

export const RangeHeaderGrid = styled(HeaderGrid)`
    grid-template-columns: 1fr 2fr 1fr 20px;
`;

export const ViewMoreFlex = styled(FlexContainer)`
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;

    &:hover {
        color: var(--accent1);
        transition: all var(--animation-speed) ease-in-out;
    }
`;

export const ItemsContainer = styled.div`
    overflow: hidden auto;

    &::-webkit-scrollbar {
        display: none;
    }
`;

export const ItemContainer = styled(GridContainer)`
    max-height: 25px;
    overflow: hidden;
    white-space: nowrap;
    border-radius: var(--border-radius);
    cursor: pointer;

    &:hover {
        transition: all var(--animation-speed) ease-in-out;
        background: var(--dark2);
    }
`;

export const RangeItemContainer = styled(ItemContainer)`
    grid-template-columns: 1fr 2fr 1fr 20px;
`;

const Icon = css<{ open: boolean }>`
    color: ${({ open }) => (open ? 'var(--text1)' : 'var(--text2)')}

    &:hover {
        color: var(--accent1);
    }
`;
export const SearchIcon = styled(BiSearch)<{ open: boolean }>`
    ${Icon}
`;
export const RecentPoolsIcon = styled(GiBackwardTime)<{ open: boolean }>`
    ${Icon}
`;
export const TopPoolsIcon = styled(LuDroplets)<{ open: boolean }>`
    ${Icon}
`;
export const FavoritePoolsIcon = styled(AiOutlineHeart)<{ open: boolean }>`
    ${Icon}
`;
export const TransactionsIcon = styled(LuFileClock)<{ open: boolean }>`
    ${Icon}
`;
export const LimitsIcon = styled(GiSaveArrow)<{ open: boolean }>`
    ${Icon}
`;
export const RangesIcon = styled(MdOutlineExpand)<{ open: boolean }>`
    ${Icon}
`;

export const ArrowIcon = styled(MdPlayArrow)<{ open: boolean }>`
    ${({ open }) =>
        open &&
        `
        transform: rotate(90deg);
        transition: var(--animation-speed);
    `}
`;

export const AccordionHeader = styled(motion.div)<{ open: boolean }>`
    display: flex;
    align-items: center;
    justify-content: ${({ open }) => (open ? 'flex-start' : 'center')};
    width: 100%;
    padding: 8px 0;
    border-bottom: 1px solid var(--dark3);

    padding-left: ${({ open }) => (open ? '10px' : '0px')};

    white-space: nowrap;
    overflow: hidden;

    cursor: pointer;

    & > div > *:not(:first-child) {
        color: var(--text1);
        transition: all var(--animation-speed) ease-in-out;
    }

    &:hover {
        & * {
            color: var(--accent1) !important;
            transition: all var(--animation-speed) ease-in-out;
        }
    }
`;

export const SearchResultsContainer = styled(FlexContainer)`
    border-radius: 4px;

    &::-webkit-scrollbar {
        display: none;
    }
`;

export const ResultsContainer = styled(FlexContainer)`
    max-height: 140px;
    overflow-y: scroll;
`;

export const Results = styled(GridContainer)`
    cursor: pointer;

    &:hover {
        transition: all var(--animation-speed) ease-in-out;
        background: var(--dark1);
        cursor: pointer;
    }
`;
