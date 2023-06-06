// START: Import React and Dongles
import { useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';

// START: Import Local Files
import styles from './SimpleModal.module.css';
import SimpleModalHeader from './SimpleModalHeader/SimpleModalHeader';
import useKeyPress from '../../../App/hooks/useKeyPress';

// interface for React functional component
interface SimpleModalPropsIF {
    noBackground?: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
}

// React functional component
export default function SimpleModal(props: SimpleModalPropsIF) {
    const { onClose, title, children, noBackground } = props;

    const isEscapePressed = useKeyPress('Escape');
    useEffect(() => {
        if (isEscapePressed) {
            onClose();
        }
    }, [isEscapePressed]);

    return (
        <aside
            className={styles.outside_modal}
            onMouseDown={onClose}
            role='dialog'
            aria-modal='true'
        >
            {/* <FocusTrap> */}
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className={`
                ${styles.modal_body}
                ${noBackground ? styles.no_background_modal : null}
                `}
                onMouseDown={(e) => e.stopPropagation()}
                style={{ justifyContent: 'flex-start' }}
                tabIndex={0}
                aria-label={`${title} modal`}
            >
                <section className={styles.modal_content}>
                    {title && (
                        <SimpleModalHeader title={title} onClose={onClose} />
                    )}
                    {children}
                </section>
            </motion.div>
            {/* </FocusTrap> */}
        </aside>
    );
}
