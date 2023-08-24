import styled from 'styled-components';
import { motion } from 'framer-motion';

export const DropdownMenuContainer = styled.div`
    z-index: 99999;
    background-color: var(--dark2);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 4px;
    border-radius: 4px;
    gap: 4px;
    height: 31px;
`;

export const SelectorSelectContainer = styled.div`
    position: relative;
`;

export const MenuContent = styled.ul`
    width: 200px;
    padding: 12px;
    overflow: hidden;
    z-index: 2;
    background: var(--dark2);
    border-radius: var(--border-radius);
    z-index: 999;

    ul,
    li {
        text-decoration: none;
        list-style-type: none;
    }
`;

export const NetworkItem = styled(motion.li)`
    display: flex;
    flex-direction: row;
    align-items: center;
    transition: background 500ms;
    padding: 8px 0;
    cursor: pointer;
    text-decoration: none;

    &:hover {
        backdrop-filter: blur(16.5px);
        -webkit-backdrop-filter: blur(16.5px);
        border-radius: 4px;
    }
`;

export const ChainNameStatus = styled.div`
    padding: 0.6rem 0;
    font-size: var(--header2-size);
    width: 100%;
    color: var(--text1);
    z-index: 9999;

    &:hover,
    &:focus-visible {
        filter: drop-shadow(0 0 5px var(--text1));
    }

    img {
        margin-right: 0.5em;
        vertical-align: middle;
    }
`;
