import { motion, HTMLMotionProps } from 'framer-motion';
import styled from 'styled-components';
import { ReactNode } from 'react';

const StyledMotionDiv = styled(motion.div)`
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

interface ProfileSettingsMotionProps
    extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'exit'> {
    children: ReactNode;
}

export const ProfileSettingsMotion: React.FC<ProfileSettingsMotionProps> = ({
    children,
    ...props
}) => {
    const motionProps = {
        initial: { opacity: 0, x: '-100%', scale: 0.9 },
        animate: { opacity: 1, x: 0, scale: 1 },
        exit: { opacity: 0, x: '100%', scale: 0.9 },
        transition: { duration: 0.3 },
    };

    return (
        <StyledMotionDiv {...motionProps} {...props}>
            {children}
        </StyledMotionDiv>
    );
};

export default ProfileSettingsMotion;
