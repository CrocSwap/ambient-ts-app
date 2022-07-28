import styles from './WaveAnimation.module.css';
import { motion } from 'framer-motion';

interface WaveAnimationProps {
    ballsAmount?: number;
    shape?: 'square' | 'circle' | 'line';
}

export default function WaveAnimation(props: WaveAnimationProps) {
    const { ballsAmount, shape } = props;

    const numberOfBalls = ballsAmount ? ballsAmount : 3;
    const loadingContainer = {
        width: 'auto',
        height: '2rem',
        display: 'flex',
        justifyContent: 'space-around',
    };

    const loadingCircle = {
        display: 'block',
        width: shape == 'line' ? '0.1rem' : '0.5rem',
        height: '0.5rem',
        // backgroundColor: 'black',
        borderRadius: shape == 'square' ? '0' : '0.25rem',
    };

    const loadingContainerVariants = {
        start: {
            transition: {
                staggerChildren: 0.2,
            },
        },
        end: {
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const loadingCircleVariants = {
        start: {
            y: '50%',
        },
        end: {
            y: '150%',
        },
    };

    const loadingCircleTransition = {
        duration: 0.5,
        yoyo: Infinity,
        ease: 'easeInOut',
    };

    const ballStyle = numberOfBalls > 4 ? styles.ball : '';
    return (
        <motion.div
            style={loadingContainer}
            variants={loadingContainerVariants}
            initial='start'
            animate='end'
            className={styles.animation_container}
        >
            {[...Array(numberOfBalls)].map((ball, idx) => (
                <motion.span
                    className={ballStyle}
                    key={idx}
                    style={loadingCircle}
                    variants={loadingCircleVariants}
                    transition={loadingCircleTransition}
                />
            ))}
        </motion.div>
    );
}
