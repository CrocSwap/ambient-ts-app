import styled from 'styled-components';

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 0;
    width: 100%;

    @media only screen and (max-width: 600px) {
        width: 100%;
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

    &:focus-visible {
        text-decoration: underline;
        text-decoration-color: var(--text1);
        border: none;
        outline: none;
    }
`;

export const Content = styled.ul`
    max-width: 1200px;
    margin: 0 auto;
    list-style-type: none;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 1rem;
`;

export const StatCardContainer = styled.li`
    background: var(--dark2);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    width: 350px;
    height: 100px;
    border-radius: 4px;
    cursor: default;
    transition: all var(--animation-speed) ease-in-out;

    &:hover {
        box-shadow: var(--glow-light-box-shadow);
    }

    @media only screen and (max-width: 600px) {
        width: 100%;
        height: 70px;
        padding: 8px;
        box-shadow: none;
    }
`;

export const StatValue = styled.div`
    font-weight: 300;
    font-size: 18px;
    line-height: 22px;
    letter-spacing: -0.02em;
    color: var(--text1);
    font-family: var(--mono);
`;
