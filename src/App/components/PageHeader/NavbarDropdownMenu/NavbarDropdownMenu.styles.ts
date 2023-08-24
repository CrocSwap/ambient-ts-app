import styled from 'styled-components';
import { motion } from 'framer-motion';

export const Dropdown = styled.div`
    position: absolute;
    top: 60px;
    width: 240px;
    height: 376px;
    transform: translateX(-45%);
    border: none;
    padding: 1rem;
    overflow: hidden;
    transition: all var(--animation-speed) ease;

    background: var(--dark2);
    border-radius: var(--border-radius);
    box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.25);
    z-index: 999;
`;

export const Menu = styled(motion.div)`
    width: 100%;
    z-index: 999;
    outline: none;
    border: none;
    background: transparent;
`;

export const MenuItem = styled.div`
    width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
    border-radius: var(--border-radius);
    padding: 0.5rem;
    cursor: pointer;
    color: var(--text1);
    font-family: var(--font-deca);
    font-weight: 300;
    font-size: var(--header2-size);
    line-height: var(--header2-lh);
    outline: none;
    border: none;
    background: transparent;

    transition: all var(--animation-speed) ease-out;
    background-position: 1% 50%;
    background-size: 400% 300%;
    text-decoration: none;

    &:hover,
    &:focus-visible {
        filter: drop-shadow(0 0 5px var(--text1));
    }
`;

export const NavbarLogoutContainer = styled.div`
    margin-top: 8px;
    display: flex;
    align-items: center;

    &:focus-visible {
        outline: none;
    }
`;

export const ConnectButton = styled.button`
    cursor: pointer;
    width: 100%;
    font-size: var(--header2-size);
    line-height: var(--header2-lh);
    color: var(--text1);
    border: none;
    outline: none;
    background: var(--accent1);
    padding: 6px 8px;
    gap: 4px;
    border-radius: var(--border-radius);

    &:hover,
    &:focus-visible {
        color: var(--accent1);
        background: var(--dark2);
        border: solid 1px var(--accent1);
    }
`;

export const IconButton = styled.div`
    margin-right: 0.5rem;
    background: var(--blur-bg);
    border-radius: 50%;
    padding: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
    text-transform: capitalize;

    &:hover {
        filter: none;
    }
`;

export const NonTopLevelContainer = styled.div`
    &:hover,
    &:focus-visible {
        background: var(--dark2);
    }
`;

export const GoBackStyle = styled.div`
    &:hover,
    &:focus-visible {
        background: var(--dark2);
    }

    .icon_button {
        background: var(--title-gradient);

        svg {
            color: black;
            transition: all var(--animation-speed) ease;
        }
    }
`;

export const IconRight = styled.span`
    margin-left: auto;
    svg {
        color: var(--text1);
    }
`;

export const ButtonContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0 10px;
`;
