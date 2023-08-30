import styled from 'styled-components';

export const ClearButton = styled.button`
    background: var(--dark2);
    width: 40px;
    border: none;
    outline: none;
    display: flex;
    align-items: center;
    box-shadow: 2px 1000px 1px var(--dark2) inset;
    transition: all var(--animation-speed) ease-in-out;

    height: 23px;
    padding: 5px 8px;
    text-decoration: none;
    border-radius: 6.25rem;
    cursor: pointer;
    font-size: 10px;
    color: var(--text2);

    &:hover {
        opacity: 0.8;
    }
`;
