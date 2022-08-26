import { motion } from 'framer-motion';
import styles from './CircleLoader.module.css';

const spinTransition = {
    loop: Infinity,
    ease: 'linear',
    duration: 1,
};

interface CircleLoaderProps {
    size?: string;
}

export default function CircleLoader(props: CircleLoaderProps) {
    const widthAndHeight = props.size ? props.size : '3rem';
    return (
        <>
            <motion.span
                style={{ width: widthAndHeight, height: widthAndHeight }}
                className={styles.circle}
                animate={{ rotate: 360 }}
                transition={spinTransition}
            />
        </>
    );
}
