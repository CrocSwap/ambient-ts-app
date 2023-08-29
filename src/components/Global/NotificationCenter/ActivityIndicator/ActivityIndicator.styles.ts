import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const pulsate = keyframes`
    0% {
        transform: scale(0.1, 0.1);
        opacity: 0;
    }
    50% {
        opacity: 1;
    }
    100% {
        transform: scale(1.2, 1.2);
        opacity: 0;
    }
`;

export const ActivityIndicatorDiv = styled(motion.div)`
    height: 34px;
    width: 34px;
    background: var(--dark2);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    cursor: pointer;
    user-select: none;

    span {
        background: var(--title-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
`;

export const CircleButton = styled(motion.button)`
    outline: none;
    padding: none;
    border: none;
    background: transparent;
`;

export const Circle = styled.button`
    position: relative;
    width: 20px;
    height: 20px;
    background-color: var(--accent4);
    border-radius: 50%;
    position: relative;
    cursor: pointer;
    display: flex;
    outline: none;
    border: none;
    padding: none;
`;

export const Ring = styled.div`
    border: 3px solid var(--accent4);
    border-radius: 30px;
    height: 40px;
    width: 40px;
    position: absolute;
    top: -50%;
    left: -50%;
    animation: ${pulsate} 1s ease-out infinite;
    opacity: 0;
`;
