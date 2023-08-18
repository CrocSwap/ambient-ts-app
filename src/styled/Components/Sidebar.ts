import styled from 'styled-components';
import { FlexContainer, GridContainer } from '../Common';

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
