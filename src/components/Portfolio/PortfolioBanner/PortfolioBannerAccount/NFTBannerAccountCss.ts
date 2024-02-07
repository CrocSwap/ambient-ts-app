import styled from 'styled-components';

const NFTBannerAccountContainer = styled.div`
    box-shadow: 4px 4px 6px #0d1117;

    position: absolute;

    width: 350px;
    height: 300px;

    gap: 16px;

    top: 30%;
    left: 50%;
    transform: translate(-50%, 30%);

    border-radius: 4px;

    border-width: 0.5px;
    border-style: solid;
    border-color: #7371fc;

    background: #0d1117;

    z-index: 5;

    overflow-y: auto;
    overflow-x: hidden;
`;

const NFTBannerHeader = styled.div`
    width: 350px;
    height: 40px;

    align-items: center;
    justify-content: center;
`;

export { NFTBannerAccountContainer, NFTBannerHeader };
