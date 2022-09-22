// START: Import React and Dongles
import { useState, useRef, ReactNode } from 'react';
import { FaAngleDown } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

// START: Import Local Files
import styles from './DropdownMenu2.module.css';
import { dropdownAnimation } from '../../../utils/others/FramerMotionAnimations';
import UseOnClickOutside from '../../../utils/hooks/useOnClickOutside';

// interface for React functional components
interface DropdownMenuPropsIF {
    title: string;
    children: ReactNode;
    marginTop?: string;
    titleWidth?: string;
    titleBackground?: string;
}

// react functional component
export default function DropdownMenu2(props: DropdownMenuPropsIF) {
    const { title, children, marginTop, titleWidth } = props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const dropdownRefItem = useRef<HTMLDivElement>(null);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const clickOutsideHandler = () => setIsMenuOpen(false);

    UseOnClickOutside(dropdownRefItem, clickOutsideHandler);

    const dropdownMenuContent = (
        <AnimatePresence>
            {isMenuOpen && (
                <motion.div
                    onClick={() => setIsMenuOpen(false)}
                    variants={dropdownAnimation}
                    initial='hidden'
                    animate='show'
                    exit='hidden'
                    className={styles.menu_container}
                    style={{ top: marginTop ? marginTop : '30px' }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );

    // TODO:   @Junior do we need the wrapper below?  See `menu_item`  -Emily
    return (
        <div ref={dropdownRefItem}>
            <div
                className={styles.menu}
                onClick={toggleMenu}
                style={{
                    minWidth: titleWidth ? titleWidth : '100px',
                    // background: titleBackground ? titleBackground : 'transparent',
                }}
            >
                <div className={styles.menu_item}>
                    <div className={styles.icon}>{title}</div>
                </div>
                <FaAngleDown />
            </div>
            {dropdownMenuContent}
        </div>
    );
}
