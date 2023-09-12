// // Import styled-components
import styled from 'styled-components/macro';
import { motion } from 'framer-motion';
// // Styled components
export const MainContainer = styled(motion.main)`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 3px 1rem;
`;

export const RectangleContainer = styled.div`
    font-family: var(--font-family);
    width: 100%;
    height: calc(20%);

    -webkit-background-size: cover;
    -moz-background-size: cover;
    -o-background-size: cover;
    background-size: cover;

    justify-content: space-between;
    align-items: flex-end;

    border-radius: 24px;

    padding: 1rem;
    position: relative;
    display: none;

    @media only screen and (min-width: 1200px) {
        display: flex;
        flex-shrink: 0;
    }
`;
