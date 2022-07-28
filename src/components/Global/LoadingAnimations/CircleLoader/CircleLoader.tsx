import { motion } from 'framer-motion';
import styles from './CircleLoader.module.css';

const spinTransition = {
    loop: Infinity,
    ease: 'linear',
    duration: 1,
};

export default function CircleLoader() {
    return (
        <>
            <motion.span
                className={styles.circle}
                animate={{ rotate: 360 }}
                transition={spinTransition}
            />
        </>
    );
}
