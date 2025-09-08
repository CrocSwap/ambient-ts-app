import styled from 'styled-components';
import { motion } from 'framer-motion';

export const Container = styled(motion.div)`
    width: 100%;
    height: 100%;
    position: absolute;
    background: var(--dark2);
    color: var(--text1);
    z-index: 3;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 1rem 2rem;
`;
