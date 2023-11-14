import styled from 'styled-components/macro';
import { motion } from 'framer-motion';

export const ProfileSettingsMotionContainer = styled(motion.div)`
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

    @media (min-width: 940px) {
        .container {
            height: calc(100vh - 5.5rem);
            width: 100%;
        }
`;
