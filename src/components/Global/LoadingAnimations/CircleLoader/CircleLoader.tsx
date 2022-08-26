import { motion } from 'framer-motion';
import styles from './CircleLoader.module.css';
import { ImCheckmark } from 'react-icons/im';
import { AiOutlineClose } from 'react-icons/ai';
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
        ? `0.5rem solid ${props.borderColor}`
        : ' 0.5rem solid white';
    console.log(borderColorStyle);
    const borderTop = '0.5rem solid #3498db';
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

    const borderColorStyle = props.borderColor
        ? `0.5rem solid ${props.borderColor}`
        : ' 0.5rem solid white';
    console.log(borderColorStyle);
    const borderTop = '0.5rem solid #3498db';
    return (
        <>
            <motion.span
                style={{
                    width: widthAndHeight,
                    height: widthAndHeight,
                    border: borderColorStyle,
                    borderTop: borderTop,
                }}
                className={styles.circle_completed}
                animate={{ rotate: 360 }}
                transition={spinTransition}
            >
                <ImCheckmark size={30} />
            </motion.span>
        </>
    );
}
export function CircleLoaderFailed(props: CircleLoaderProps) {
    const widthAndHeight = props.size ? props.size : '3rem';

    const borderColorStyle = props.borderColor
        ? `0.5rem solid ${props.borderColor}`
        : ' 0.5rem solid white';
    console.log(borderColorStyle);
    const borderTop = '0.5rem solid #3498db';
    return (
        <>
            <motion.span
                style={{
                    width: widthAndHeight,
                    height: widthAndHeight,
                }}
                className={styles.circle_failed}
            >
                <AiOutlineClose size={30} color='#F6385B' />
            </motion.span>
        </>
    );
}
