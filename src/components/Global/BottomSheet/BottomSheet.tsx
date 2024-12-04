import { motion, PanInfo, useAnimation } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RiCloseFill } from 'react-icons/ri';
import { useBottomSheet } from '../../../contexts/BottomSheetContext';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import styles from './BottomSheet.module.css';

interface BottomSheetProps {
    title?: string;
    footer?: React.ReactNode;
    children: React.ReactNode;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
    title = '',
    footer,
    children,
}) => {
    const { isBottomSheetOpen, closeBottomSheet } = useBottomSheet();

    const mainRef = useRef<HTMLDivElement>(null);

    const clickOutsideLevelHandler = () => {
        closeBottomSheet();
    };
    useOnClickOutside(mainRef, clickOutsideLevelHandler);

    const controls = useAnimation();
    const isMobile = useMediaQuery('(max-width: 500px)');
    // eslint-disable-next-line
    const [isDragging, setIsDragging] = useState(false);

    const variants = {
        hidden: { y: window.innerHeight, opacity: 0 }, // Replace '100%' with viewport height
        visible: { y: 0, opacity: 1 },
    };

    const handleDragEnd = (
        _: MouseEvent | TouchEvent | PointerEvent,
        info: PanInfo,
    ) => {
        setIsDragging(false);
        if (info.offset.y > 100) {
            closeBottomSheet();
        } else {
            controls.start({ y: 0 });
        }
    };

    useEffect(() => {
        if (isBottomSheetOpen) {
            controls.start('visible');
        } else {
            controls.start('hidden');
        }
    }, [isBottomSheetOpen, controls]);

    const escFunction = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isBottomSheetOpen) {
                closeBottomSheet();
            }
        },
        [isBottomSheetOpen, closeBottomSheet],
    );

    useEffect(() => {
        document.addEventListener('keydown', escFunction, false);
        return () => {
            document.removeEventListener('keydown', escFunction, false);
        };
    }, [escFunction]);

    // Handle clicks on the overlay to close the modal
    const handleOverlayClick = (e: React.MouseEvent) => {
        e.preventDefault();
        closeBottomSheet(); // Close sheet when clicking outside the modal
    };

    // Prevent clicks inside the modal from closing it
    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Stop event from bubbling up to the overlay
    };

    return (
        <>
            {isBottomSheetOpen && (
                <div
                    className={styles.modal_overlay}
                    onClick={handleOverlayClick} // Close modal only on clicking overlay
                />
            )}
            <motion.div
                className={styles.bottom_sheet}
                initial='hidden'
                animate={controls}
                exit='hidden'
                variants={variants}
                transition={{
                    duration: 0.5,
                    type: 'spring',
                    damping: 25,
                    stiffness: 200,
                }}
                drag={isMobile ? 'y' : false}
                dragConstraints={{ top: 0 }}
                dragElastic={0.2}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                onClick={handleModalClick} // Ensure modal clicks don't trigger overlay close
            >
                <div className={styles.sheet_handle}>
                    <div className={styles.drag_handle} />
                </div>
                <header className={styles.sheet_header}>
                    <h2 className={styles.sheet_title}>{title}</h2>
                    <RiCloseFill
                        className={styles.close_button}
                        size={24}
                        onClick={closeBottomSheet}
                    />
                </header>
                <section className={styles.sheet_content}>{children}</section>
                {footer && (
                    <footer className={styles.sheet_footer}>{footer}</footer>
                )}
            </motion.div>
        </>
    );
};

export default BottomSheet;
