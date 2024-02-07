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
    display: flex;

    height: 40px;

    margin: 10px;

    align-items: center;
    justify-content: space-between;
`;

const NFTDisplay = styled.div`
    padding: 10px;
    justifycontent: space-evenly;

    alignitems: center;
    gap: 10px;

    display: grid;
    grid-template-columns: repeat(4, 1fr);
`;

export { NFTBannerAccountContainer, NFTBannerHeader, NFTDisplay };
