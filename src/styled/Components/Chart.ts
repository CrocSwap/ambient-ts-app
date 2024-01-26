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

export const ArrowContainer = styled.div<{ degree?: number }>`
    display: inline-block;
    width: 10px;
    height: 10px;
    cursor: pointer;
    font-size: var(--body-lh);
    line-height: var(--body-lh);
    color: var(--text2);
    border-top: 1px solid var(--text2);
    border-right: 1px solid var(--text2);
    transition: all 600ms;
    margin: auto;
    transform: ${({ degree }) => `rotate(${degree}deg)`};
`;
