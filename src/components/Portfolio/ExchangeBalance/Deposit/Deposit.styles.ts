import styled from 'styled-components/macro';

export const MaxButton = styled.button<{ disabled: boolean }>`
    font-size: var(--body-size);
    line-height: var(--body-lh);
    color: var(--text1);
    outline: none;
    border: none;

    color: var(--text1);

    width: 60px;
    display: flex;
    justify-content: left;
    align-items: center;
    margin-left: 6px;

    max-height: 20px;
    transition: all var(--animation-speed) ease-in-out;
    background: transparent;
    border-radius: var(--border-radius);

    ${({ disabled }) => (disabled ? '' : 'cursor: pointer;')}
`;
