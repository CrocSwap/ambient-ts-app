import { motion } from 'framer-motion';
import styles from './CircleLoader.module.css';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
const spinTransition = {
    loop: Infinity,
    ease: 'linear',
    duration: 1,
};

interface CircleLoaderProps {
    size?: string;
    borderColor?: string;
}

export function CircleLoader(props: CircleLoaderProps) {
    const widthAndHeight = props.size ? props.size : '3rem';

    const borderColorStyle = props.borderColor
        ? `0.2rem solid ${props.borderColor}`
        : ' 0.2rem solid white';

    const borderTop = '0.2rem solid #3498db';
    return (
        <>
            <motion.span
                style={{
                    width: widthAndHeight,
                    height: widthAndHeight,
                    border: borderColorStyle,
                    borderTop: borderTop,
                }}
                className={styles.circle}
                animate={{ rotate: 360 }}
                transition={spinTransition}
            />
        </>
    );
}

export function CircleLoaderCompleted(props: CircleLoaderProps) {
    const widthAndHeight = props.size ? props.size : '3rem';

    return (
        <>
            <motion.span
                style={{
                    width: widthAndHeight,
                    height: widthAndHeight,
                }}
                className={styles.circle_completed}
            >
                <IoCheckmarkCircleOutline size={30} color='var(--positive)' />
            </motion.span>
        </>
    );
}
export function CircleLoaderFailed(props: CircleLoaderProps) {
    const widthAndHeight = props.size ? props.size : '30';

    return (
        <>
            <motion.span
                style={{
                    width: widthAndHeight,
                    height: widthAndHeight,
                }}
            >
                <AiOutlineCloseCircle
                    size={widthAndHeight}
                    color='var(--negative)'
                />
            </motion.span>
        </>
    );
}
