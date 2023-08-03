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
            event.stopPropagation();
            // prevent the auto focusing on element
            document?.activeElement &&
                (document.activeElement as HTMLElement).blur();
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
            {centeredTitle && <div />}
            <h2 className={styles.modal_title}>{title}</h2>
            <div className={styles.header_right}>
                {headerRightItems && headerRightItems}
                <span />
                <RiCloseFill
                    id='close_modal_button'
                    size={27}
                    className={styles.close_button}
                    onClick={onClose}
                    role='button'
                    tabIndex={-1}
                    aria-label='Close modal button'
                    style={{ cursor: 'pointer' }}
                />
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
        <aside
            id='Modal_Global'
            className={styles.outside_modal}
            onMouseDown={
                desktopView
                    ? (e) => {
                          onClose();
                          e.stopPropagation();
                      }
                    : undefined
            }
            role='dialog'
            aria-modal='true'
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
                tabIndex={0}
                aria-label={`${title} modal`}
            >
                {headerOrNull}
                <section
                    className={styles.modal_content}
                    aria-live='polite'
                    aria-atomic='true'
                    aria-relevant='additions text'
                >
                    {children}
                </section>
                {footerOrNull}
            </motion.div>
        </aside>
    );
}
