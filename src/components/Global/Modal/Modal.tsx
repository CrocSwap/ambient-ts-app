// START: Import React and Dongles
import { useCallback, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { BiArrowBack } from 'react-icons/bi';
import { RiCloseFill } from 'react-icons/ri';

// START: Import Local Files
import styles from './Modal.module.css';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';

// interface for React functional component
interface ModalPropsIF {
    content?: ReactNode;
    onClose: () => void;
    handleBack?: () => void;
    showBackButton?: boolean;
    title: string | ReactNode;
    footer?: ReactNode;
    noHeader?: boolean;
    noBackground?: boolean;
    children: ReactNode;
    centeredTitle?: boolean;
    headerRightItems?: ReactNode;
}

// React functional component
export default function Modal(props: ModalPropsIF) {
    const {
        onClose,
        handleBack,
        title,
        footer,
        noHeader,
        noBackground,
        children,
        showBackButton,
        centeredTitle,
        headerRightItems,
    } = props;

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
        <div style={{ cursor: 'pointer' }}>
            <BiArrowBack size={27} onClick={handleBack} />
        </div>
    );
    // JSX for the header element
    const headerJSX = (
        <header className={styles.modal_header}>
            {showBackButton && backElement}
            {centeredTitle && <div></div>}
            <h2 className={styles.modal_title}>{title}</h2>
            <div className={styles.header_right}>
                {headerRightItems && headerRightItems}
                <RiCloseFill size={27} className={styles.close_button} onClick={onClose} />
            </div>
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

    const desktopView = useMediaQuery('(min-width: 720px)');

    return (
        <div
            id='Modal_Global'
            className={styles.outside_modal}
            onMouseDown={desktopView ? onClose : undefined}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className={`
                    ${styles.modal_body}
                    ${noBackground ? styles.no_background_modal : null}
                `}
                onMouseDown={(e) => e.stopPropagation()}
            >
                {headerOrNull}
                <section className={styles.modal_content}>{children}</section>
                {footerOrNull}
            </motion.div>
        </div>
    );
}
