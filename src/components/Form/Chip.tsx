import styled from 'styled-components/macro';

interface PropsIF {
    key?: string;
    ariaLabel?: string;
    selected?: boolean;
    onClick: () => void;
    variant?: 'outlined' | 'secondary' | 'filled'; // default is outlined
}

const purpleOutlineHover = `                
&:hover {
    border: 1px solid var(--accent1);
    color: var(--accent1);
}
&:hover svg {
    color: var(--accent1) !important;
}`;

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

    border: 1px solid var(--dark3);
    border-radius: 50px;

    ${({ variant }) => {
        switch (variant) {
            case 'secondary':
                return `
                color: var(--text2);
                background-color: var(--dark2);
                ${purpleOutlineHover}
                `;
            case 'filled':
                return `background-color: var(--accent1);
                color: var(--text1);`;

            case 'outlined':
            default:
                return `
                color: var(--text1);
                background: var(--dark1);
                ${purpleOutlineHover}
                `;
        }
    }}
`;
