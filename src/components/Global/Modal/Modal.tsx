// START: Import React and Dongles
import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { BiArrowBack } from 'react-icons/bi';
import { RiCloseFill } from 'react-icons/ri';

// START: Import Local Files
import styles from './Modal.module.css';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import GlobalModalPortal from '../../GlobalModalPortal';

// interface for React functional component
interface ModalPropsIF {
    isOpen?: boolean;
    onClose?: () => void;
    handleBack?: () => void;
    showBackButton?: boolean;
    title?: string;
    footer?: ReactNode;
    noHeader?: boolean;
    noBackground?: boolean;
    children: ReactNode;
    centeredTitle?: boolean;
    headerRightItems?: ReactNode;
    usingCustomHeader?: boolean;
}

// React functional component
export default function Modal(props: ModalPropsIF) {
    const {
        handleBack,
        title = '',
        footer,
        noHeader,
        noBackground,
        children,
        showBackButton,
        centeredTitle,
        headerRightItems,
        usingCustomHeader = false,
        isOpen = false,
        onClose = () => null,
    } = props;

    // TODO: implement escape key press

    // jsx for the back element
    const backElement = (
        <div style={{ cursor: 'pointer' }}>
            <BiArrowBack size={27} onClick={handleBack} />
        </div>
    );
    // JSX for the header element
    const headerJSX = !usingCustomHeader ? (
        <header className={styles.modal_header}>
            {showBackButton && backElement}
            {(title !== '' || centeredTitle) && <div />}
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
    ) : (
        <></>
    );

    const footerJSX = <footer className={styles.modal_footer}>{footer}</footer>;

    const headerOrNull = noHeader ? null : headerJSX;
    const footerOrNull = !footer ? null : footerJSX;

    const desktopView = useMediaQuery('(min-width: 720px)');

    return (
        <GlobalModalPortal isOpen={isOpen}>
            <aside
                id='Modal_Global'
                className={styles.outside_modal}
                onMouseDown={desktopView ? onClose : undefined}
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
        </GlobalModalPortal>
    );
}
