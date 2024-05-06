import styled, { css } from 'styled-components/macro';
import { motion } from 'framer-motion';
import { FlexContainer } from '../../../styled/Common';

interface MenuProps {
    expandable: boolean;
}
export const Menu = styled(FlexContainer)<MenuProps>`
    border-right: 4px solid transparent;
    transition: 0.2s cubic-bezier(0.6, -0.28, 0.735, 0.045);
    z-index: 999;
    ${({ expandable }) =>
        expandable &&
        css`
            cursor: pointer !important;
        `}
    @media only screen and (min-width: 1020px) {
        gap: 0;
    }
`;

export const MenuItem = styled(FlexContainer)`
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

export const Icon = styled(FlexContainer)`
    cursor: pointer;
    img {
        margin-right: 0.5em;
    }
`;

export const LinkText = styled.span`
    white-space: nowrap;
    font-size: 15px;
    color: var(--text1);
`;
