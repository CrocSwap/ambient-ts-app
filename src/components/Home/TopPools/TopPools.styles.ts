import styled from 'styled-components';

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @media only screen and (min-width: 768px) {
        padding: 1rem 0;
    }
`;

export const Title = styled.div`
    font-style: normal;
    font-weight: 300;
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

export const Content = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    list-style-type: none;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 1rem;
`;

export const ViewMore = styled.div`
    color: var(--accent1);
    font-size: var(--header2-size);
    line-height: var(--header2-lh);
    font-weight: 400;
    text-decoration: underline;
`;
