import styled from 'styled-components/macro';

export const TutorialButton = styled.button`
    outline: none;
    background: var(--dark2);
    border: 1px solid var(--accent1);
    color: var(--text2);
    border-radius: 4px;
    padding: 0 4px;
    transition: all var(--animation-speed) ease-in-out;
    cursor: pointer;

    box-shadow: var(--trade-box-shadow);

    &:hover {
        color: var(--text1);
    }
`;
