import styled from 'styled-components';

const buttonSize = 'calc(var(--nav-size) * 0.5)';

export const NavItemButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    outline: none;
    border: none;
    background: transparent;

    &:focus-visible .icon_button {
        filter: brightness(1.2);
        background: var(--dark2);
    }
`;

interface IconButtonProps {
    square: boolean | undefined;
}

export const IconButton = styled.div<IconButtonProps>`
    height: ${buttonSize};
    background-color: var(--dark2);
    border-radius: ${(props) => (props.square ? '4px' : '50%')};
    padding: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--animation-speed) ease-in-out;
    cursor: pointer;

    &:hover,
    &:focus-visible {
        filter: brightness(1.2);
        background: var(--dark2);
    }

    svg {
        fill: var(--text1);
        width: 20px;
        height: 20px;
    }
`;
