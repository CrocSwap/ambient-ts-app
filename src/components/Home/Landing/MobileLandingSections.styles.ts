import styled from 'styled-components';
import { FlexContainer, hideScrollbarCss } from '../../../styled/Common';

export const MainLogo = styled.div`
    width: 100%;
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-size: cover;
    background-position: center center;

    img {
        width: 200px;
        height: 100px;
        object-fit: contain;
        margin-top: 3rem;
    }
`;

export const StyledTopPools = styled.div`
    padding: 20px;
`;

const BgBase = styled.div`
    position: absolute;
    left: 0;
    width: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    -webkit-background-size: cover;
    -moz-background-size: cover;
    -o-background-size: cover;
`;

export const Bg1 = styled(BgBase)`
    top: 200px;
    height: 900px;
`;

export const Bg2 = styled(BgBase)`
    background-position: right bottom;
    bottom: 0;
    height: 150px;
`;

export const Bg3 = styled(BgBase)`
    bottom: 0;
    height: 80px;
`;

export const Bg4 = styled(BgBase)`
    bottom: 0;
    height: 200px;
`;

export const BgFooter = styled(BgBase)`
    top: 350px;
    height: 500px;
`;

export const MainContainer = styled.div<{ isIPhone: boolean }>`
    position: relative;
    overflow-y: scroll;
    width: 100%;
    overflow-x: hidden;
    max-width: 100dvw;
    background: var(--dark1);
    ${hideScrollbarCss}

    ${({ isIPhone }) => `height: ${isIPhone ? '100dvh' : '100vh'};`}
    ${({ isIPhone }) =>
        `scroll-snap-type: ${isIPhone ? 'y mandatory' : 'none'};`}
`;

export const MobileCard = styled(FlexContainer)`
    height: 100%;
    padding: 20px;
    border-radius: 8px;
    justify-content: center;
    position: relative;
    scroll-snap-align: center;
    align-items: center;
    text-align: center;
    gap: 10px;
`;
