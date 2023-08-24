import styled from 'styled-components';
import { motion } from 'framer-motion';

export const Menu = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    color: var(--text1);
    width: 100%;
    border-right: 4px solid transparent;
    transition: 0.2s cubic-bezier(0.6, -0.28, 0.735, 0.045);
    justify-content: center;
    gap: 4px;
    position: relative;
    z-index: 999;

    @media only screen and (min-width: 1020px) {
        justify-content: space-between;
        gap: 0;
    }
`;

export const MenuItem = styled.div`
    display: flex;
    gap: 4px;
    cursor: pointer;
    z-index: 999;
`;

export const MenuContainer = styled(motion.div)`
    width: 100%;
    display: flex;
    flex-direction: column;
    position: absolute;
    z-index: 999;
`;

export const Icon = styled.div`
    display: flex;
    cursor: pointer;
    justify-content: center;
    align-items: center;

    img {
        margin-right: 0.5em;
    }
`;

export const LinkText = styled.span`
    white-space: nowrap;
    font-size: 15px;
    color: var(--text1);
`;
