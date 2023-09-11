import styled from 'styled-components/macro';
import { motion } from 'framer-motion';
import {
    ContainerProps,
    ContainerStyles,
    FlexProps,
    Flex,
    BreakpointProps,
    Breakpoint,
    WrappedContainerStyles,
} from '../../../styled/Common';

export const ControlContainer = styled.div`
    cursor: pointer;
    display: none;
    position: absolute;
    right: 8px;
    top: 8px;

    @media only screen and (min-width: 1200px) {
        display: flex;
        border-radius: var(--border-radius);
    }
`;

export const MotionContainer = styled(motion.div)<
    ContainerProps & FlexProps & BreakpointProps
>`
    ${WrappedContainerStyles}
    ${Flex}
    ${Breakpoint}
`;

export const MotionSubContainer = styled(motion.div)<
    ContainerProps & FlexProps & BreakpointProps
>`
    ${ContainerStyles}
    ${Flex}
    ${Breakpoint}
    @media only screen and (max-width: 600px) {
        border-radius: var(--border-radius);
        color: blue;
    }
`;

export const InfoText = styled.div`
    font-size: var(--body-size);
    line-height: 22.5px;
    color: var(--text2);
    background: var(--dark1);
    font-weight: 300;
    text-align: center;
    padding: 8px;
    border-radius: var(--border-radius);

    /* prevents the exchange balance sidebar from expanding downward on open */
    max-height: 80px;
    text-overflow: ellipsis;
    overflow: hidden;
`;

InfoText.displayName = 'InfoText';
