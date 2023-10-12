import styled from 'styled-components/macro';

export const TutorialButton = styled.button`
    outline: none;
    background: var(--dark2);
    border: 1px solid var(--accent1);
    color: var(--text2);
    border-radius: var(--border-radius);
    padding: 0 4px;
    transition: var(--transition);
    cursor: pointer;

    box-shadow: var(--trade-box-shadow);

    &:hover {
        color: var(--text1);
    }
`;
