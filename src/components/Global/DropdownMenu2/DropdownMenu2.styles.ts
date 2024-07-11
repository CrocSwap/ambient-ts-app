import styled, { css } from 'styled-components/macro';
import { motion } from 'framer-motion';
import { FlexContainer } from '../../../styled/Common';

interface MenuProps {
    expandable: boolean;
}
export const Menu = styled(FlexContainer)`
    border-right: 4px solid transparent;
    transition: 0.2s cubic-bezier(0.6, -0.28, 0.735, 0.045);
    z-index: 999;
    @media only screen and (min-width: 1020px) {
        gap: 0;
    }

    @media only screen and (max-width: 1200px) {
        width: auto;
        white-space: no-wrap;
        text-wrap: none;
    }
`;

export const MenuItem = styled(FlexContainer)`
    width: 100%;
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

export const Icon = styled(FlexContainer)<MenuProps>`
    ${({ expandable }) =>
        !expandable &&
        css`
            cursor: default;
            text-wrap: none;
            min-width: 150px;
        `}
    img {
        margin-right: 0.5em;
    }
`;

export const LinkText = styled.span`
    white-space: nowrap;
    font-size: 15px;
    color: var(--text1);
`;
