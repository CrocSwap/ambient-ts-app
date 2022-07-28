// import styles from './BouncingBall.module.css'
import { motion } from 'framer-motion';

const ballStyle = {
    display: 'block',
    width: '1rem',
    height: '1rem',
    backgroundColor: 'black',
    borderRadius: '0.5rem',
};

const bounceTransition = {
    y: {
        duration: 0.4,
        yoyo: Infinity,
        ease: 'easeOut',
    },
    backgroundColor: {
        duration: 0,
        yoyo: Infinity,
        ease: 'easeOut',
        repeatDelay: 0.8,
    },
};

export default function BouncingBall() {
    return (
        <motion.div
            style={ballStyle}
            transition={bounceTransition}
            animate={{
                backgroundColor: ['#7371FC', '#CDC1FF'],
                y: ['100%', '-100%'],
            }}
        />
    );
}
