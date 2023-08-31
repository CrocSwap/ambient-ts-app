import styled from 'styled-components';
import { FlexContainer, GridContainer } from '../../../styled/Common';

export const InvestorsContainer = styled.div`
    border-bottom: 1px solid var(--border);
    padding: 1rem 0 3rem 0;
`;

export const H3 = styled.h3`
    color: var(--text1);
    font-weight: 400;
    font-size: 24px;
    line-height: 30px;
    text-align: center;
    margin: 1rem 0;
`;

export const InvestorsContent = styled(FlexContainer)`
    @media only screen and (max-width: 1020px) {
        justify-content: center;
        align-items: center;
        width: 100dvw;
    }

    @media only screen and (min-width: 1020px) {
        max-width: 1020px;
    }

    @media only screen and (max-width: 1020px) img {
        width: 80px;
    }
`;

export const Row = styled.div<{ row: number }>`
    display: flex;
    gap: 1rem;
    max-width: 100%;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    place-items: center;

    @media only screen and (min-width: 1020px) {
        ${({ row }) => {
            switch (row) {
                case 2:
                case 3:
                case 7:
                    return 'justify-content: space-around;';
                case 4:
                    return 'display: grid; grid-template-columns: repeat(4, 1fr);';
                case 5:
                    return 'display: grid; grid-template-columns: repeat(6, 1fr);';
                default:
                    return '';
            }
        }}
    }
`;

export const MobileContainer = styled(GridContainer)`
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    align-items: center;
    justify-items: center;
    align-content: center;
    padding: 1rem 2rem;

    img {
        max-width: 100%;
        height: auto;
    }

    span {
        text-align: center;
    }
`;

export const PreSeedMobile = styled.div`
    display: grid;
    grid-gap: 10px;
    justify-items: center;
`;
