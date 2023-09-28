import styled from 'styled-components/macro';
import { FlexContainer, Text } from '../Common';

export const HeaderButtons = styled.button<{ mobileHide?: boolean }>`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    outline: none;
    border: none;
    background: transparent;
    cursor: pointer;
    gap: 4px;

    &:focus-visible {
        box-shadow: var(--glow-light-box-shadow);
    }

    @media (max-width: 680px) {
        ${({ mobileHide }) => mobileHide && 'display: none'};
    }
`;

export const HeaderText = styled(Text)`
    @media (max-width: 968px) {
        font-size: var(--header-size);
        line-height: var(--body-lh);
    }
`;

export const MainContainer = styled(FlexContainer)`
    position: relative;

    @media only screen and (min-device-width: 320px) and (max-device-width: 1200px) and (-webkit-min-device-pixel-ratio: 2) {
        overflow: hidden;
    }
`;
