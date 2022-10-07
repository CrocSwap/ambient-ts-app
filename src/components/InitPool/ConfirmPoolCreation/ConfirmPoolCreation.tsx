import styles from './ConfirmPoolCreation.module.css';
import { motion } from 'framer-motion';

interface confirmPoolCreationPropsIF {
    animation: {
        initial: {
            opacity: number;
            x: number;
        };
        animate: {
            opacity: number;
            x: number;
        };
        exit: {
            opacity: number;
            x: number;
        };
    };
}
export default function ConfirmPoolCreation(props: confirmPoolCreationPropsIF) {
    const { animation } = props;

    return (
        <motion.div
            variants={animation}
            initial='initial'
            animate='animate'
            exit='exit'
            transition={{ duration: 0.2 }}
            className={styles.container}
        >
            <p>
                Currently deciding whether this is needed or if it should be replace with a Confirm
                Pool Modal
            </p>
        </motion.div>
    );
}
