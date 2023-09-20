import styled from 'styled-components/macro';

export const ExplanationButton = styled.button`
    background: transparent;
    outline: none;
    border: none;
    display: flex;
    justify-content: center;

    &:focus-visible {
        outline: 1px solid var(--text1);
    }
`;
