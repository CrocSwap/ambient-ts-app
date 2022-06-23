import styles from './Modal.module.css';
import { RiCloseFill } from 'react-icons/ri';
import { BiArrowBack } from 'react-icons/bi';

import { useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
interface ModalProps {
    content?: React.ReactNode;
    onClose: () => void;
    handleBack?: () => void;
    showBackButton?: boolean;
    title: string | React.ReactNode;
    footer?: React.ReactNode;
    noHeader?: boolean;
    noBackground?: boolean;
    children: React.ReactNode;
}

export default function Modal(props: ModalProps) {
    const { onClose, handleBack, title, footer, noHeader, noBackground, children, showBackButton } =
        props;

    const escFunction = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', escFunction, false);

        return () => {
            document.removeEventListener('keydown', escFunction, false);
        };
    }, []);

    // jsx for the back element
    const backElement = (
        <div>
            <BiArrowBack size={27} onClick={handleBack} />
        </div>
    );
    // JSX for the header element
    const headerJSX = (
        <header className={styles.modal_header}>
            {showBackButton && backElement}
            <h2 className={styles.modal_title}>{title}</h2>
            <RiCloseFill size={27} className={styles.close_button} onClick={onClose} />
        </header>
    );

    // JSX for the footer element
    const footerJSX = <footer className={styles.modal_footer}>{footer}</footer>;

    // variables to hold both the header or footer JSX elements vs `null`
    // ... both elements are optional and either or both may be absent
    // ... from any given modal, this allows the element to render `null`
    // ... if the element is not being used in a particular instance
    const headerOrNull = noHeader ? null : headerJSX;
    const footerOrNull = !footer ? null : footerJSX;

    return (
        <div className={styles.outside_modal} onClick={onClose}>
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 150 }}
                className={`
                    ${styles.modal_body}
                    ${noBackground ? styles.no_background_modal : null}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {headerOrNull}
                <section className={styles.modal_content}>{children}</section>
                {footerOrNull}
            </motion.div>
        </div>
    );
}
