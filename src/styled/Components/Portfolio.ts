import styled from 'styled-components/macro';

export const PortfolioTabsContainer = styled.div`
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding-left: 28px;

    border-radius: var(--border-radius);
    background: var(--dark1);

    align-items: stretch;

    @media only screen and (min-device-width: 320px) and (max-device-width: 1200px) and (-webkit-min-device-pixel-ratio: 2) {
        margin: 0 auto;
        width: 90%;
        margin-left: 30px;

        padding: 0 1rem;
    }
`;
