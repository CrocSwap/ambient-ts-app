import { motion } from 'framer-motion';
import styles from './CircleLoader.module.css';

const spinTransition = {
    loop: Infinity,
    ease: 'linear',
    duration: 1,
};

interface CircleLoaderProps {
    size?: string;
    borderColor?: string;
}

export default function CircleLoader(props: CircleLoaderProps) {
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
