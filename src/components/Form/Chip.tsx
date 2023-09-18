import styled from 'styled-components/macro';

interface PropsIF {
    key?: string;
    ariaLabel?: string;
    selected?: boolean;
    onClick: () => void;
}

export const Chip = styled.button<PropsIF>`
    outline: none;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all var(--animation-speed) ease-in-out;
    white-space: nowrap;
    height: 23px;
    padding: 5px 8px;
    text-decoration: none;
    cursor: pointer;
    font-size: var(--body-size);
    color: var(--text1);
    background: var(--dark1);
    border: 1px solid var(--dark3);
    border-radius: 50px;

    &:hover {
        border: 1px solid var(--accent1);
        color: var(--accent1);
    }

    &:hover svg {
        color: var(--accent1) !important;
    }
`;
