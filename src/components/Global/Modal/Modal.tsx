import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { BiArrowBack } from 'react-icons/bi';
import { RiCloseFill } from 'react-icons/ri';
import styles from './Modal.module.css';
import GlobalModalPortal from '../../GlobalModalPortal';
import { GLOBAL_MODAL_COMPONENT_ID } from '../../../ambient-utils/constants';
import { Container } from '../../../styled/Common';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';

interface ModalPropsIF {
    onClose: () => void;
    handleBack?: () => void;
    showBackButton?: boolean;
    title?: string;
    footer?: ReactNode;
    noBackground?: boolean;
    children: ReactNode;
    centeredTitle?: boolean;
    headerRightItems?: ReactNode;
    usingCustomHeader?: boolean;
}

export default function Modal(props: ModalPropsIF) {
    const {
        handleBack,
        title = '',
        footer,
        noBackground,
        children,
        showBackButton,
        headerRightItems,
        centeredTitle = true,
        usingCustomHeader = false,
        onClose = () => null,
    } = props;

 

    const [isDragging, setIsDragging] = useState(false);
    const controls = useAnimation();
    const isMobile = useMediaQuery('(max-width: 500px)');

    const escFunction = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', escFunction, false);
        return () => {
            document.removeEventListener('keydown', escFunction, false);
        };
    }, [escFunction]);

    useEffect(() => {
        controls.start('visible');
    }, [controls]);

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        setIsDragging(false);
        if (info.offset.y > 100 && isMobile) {
            onClose();
        } else {
            controls.start({ y: 0 });
        }
    };

    const headerJSX = !usingCustomHeader ? (
        <header className={styles.modal_header}>
            {showBackButton && (
                <div style={{ cursor: 'pointer' }}>
                    <BiArrowBack size={27} onClick={handleBack} />
                </div>
            )}
            {centeredTitle && <div />}
            <h2 className={styles.modal_title}>{title}</h2>
            <div className={styles.header_right}>
                {headerRightItems}
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
    ) : null;

    const footerJSX = footer ? (
        <footer className={styles.modal_footer}>{footer}</footer>
    ) : null;

    const variants = {
        hidden: { opacity: 0, y: isMobile ? '100%' : 0, scale: isMobile ? 1 : 0.5 },
        visible: { opacity: 1, y: 0, scale: 1 },
    };



    return (
        <GlobalModalPortal>
            <aside
                id={GLOBAL_MODAL_COMPONENT_ID}
                className={styles.outside_modal}
                onMouseDown={!isDragging ? onClose : undefined}
                role='dialog'
                aria-modal='true'
            >
                <motion.div
                    drag={isMobile ? 'y' : false}
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={0.2}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    initial="hidden"
                    animate={controls}
                    exit="hidden"
                    variants={variants}
                    transition={{ duration: 0.4 }}
                    className={`${styles.modal_body} ${noBackground ? styles.no_background_modal : ''}`}
                    onMouseDown={(e) => e.stopPropagation()}
                    tabIndex={0}
                    aria-label={`${title} modal`}
                >
                    <Container boxShadow={!isMobile ? 'gradient' : undefined}>
                        {isMobile && (
                            <div className={styles.drag_handle} />
                        )}
                        {headerJSX}
                        <section
                            className={styles.modal_content}
                            aria-live='polite'
                            aria-atomic='true'
                            aria-relevant='additions text'
                        >
                            {children}
                        </section>
                        {footerJSX}
                    </Container>
                </motion.div>
            </aside>
        </GlobalModalPortal>
    );
}