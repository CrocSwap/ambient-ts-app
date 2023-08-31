import styled from 'styled-components';
import { FlexContainer } from '../Common';

export const HomeTitle = styled.div`
    font-style: normal;
    font-size: 24px;
    line-height: 30px;
    text-align: center;
    letter-spacing: -0.02em;
    color: var(--text1);
    font-weight: 400;

    &:focus-visible {
        text-decoration: underline;
        text-decoration-color: var(--text1);
        border: none;
        outline: none;
    }
`;

export const HomeContent = styled(FlexContainer)`
    max-width: 1200px;
    margin: 0 auto;
    list-style-type: none;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 1rem;
`;
