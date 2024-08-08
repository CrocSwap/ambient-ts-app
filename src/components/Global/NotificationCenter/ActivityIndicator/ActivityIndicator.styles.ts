import styled, { keyframes } from 'styled-components/macro';
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

interface StyledProps {
    isFuta: boolean;
}

const getAccentColor = (isFuta: boolean) =>
    isFuta ? 'var(--accent1)' : 'var(--accent4)';

export const ActivityIndicatorDiv = styled(motion.div)<StyledProps>`
    height: 30px;
    width: 30px;
    background: var(--dark2);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: ${({ isFuta }) => (isFuta ? '0' : '50%')};
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

export const Circle = styled.button<StyledProps>`
    position: relative;
    width: ${({ isFuta }) => (isFuta ? '16.66px' : '20px')};
    height: ${({ isFuta }) => (isFuta ? '16.66px' : '20px')};

    background-color: ${({ isFuta }) => getAccentColor(isFuta)};
    border-radius: ${({ isFuta }) => (isFuta ? '0' : '50%')};
    position: relative;
    cursor: pointer;
    display: flex;
    outline: none;
    border: none;
    padding: none;
`;

export const Ring = styled.div<StyledProps>`
    border: 3px solid ${({ isFuta }) => getAccentColor(isFuta)};
    border-radius: ${({ isFuta }) => (isFuta ? '0' : '30px')};

    width: ${({ isFuta }) => (isFuta ? '33.33px' : '40px')};
    height: ${({ isFuta }) => (isFuta ? '33.33px' : '40px')};
    position: absolute;
    top: -50%;
    left: -50%;
    animation: ${pulsate} 1s ease-out infinite;
    opacity: 0;
`;
