// START: Import React and Dongles
import { useState, useRef, ReactNode } from 'react';
import { FaAngleDown } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';

// START: Import Local Files
import styles from './DropdownMenu2.module.css';
import { dropdownAnimation } from '../../../utils/others/FramerMotionAnimations';
import UseOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';

// interface for React functional components
interface DropdownMenuPropsIF {
    title: string;
    children: ReactNode;
    marginTop?: string;
    titleWidth?: string;
    logo?: string;
}

// react functional component
export default function DropdownMenu2(props: DropdownMenuPropsIF) {
    const { title, children, marginTop, titleWidth, logo } = props;
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

    const desktopScreen = useMediaQuery('(min-width: 1020px)');

    return (
        <div ref={dropdownRefItem}>
            <div
                className={styles.menu}
                onClick={toggleMenu}
                style={{
                    minWidth: !desktopScreen
                        ? ''
                        : titleWidth
                        ? titleWidth
                        : '100px',
                }}
            >
                <div className={styles.menu_item}>
                    {desktopScreen && (
                        <div className={styles.icon}>
                            <img
                                src={logo}
                                alt={title}
                                width='18px'
                                height='18px'
                                style={{ borderRadius: '50%' }}
                            />
                            {title}
                        </div>
                    )}
                    {!desktopScreen && (
                        <img
                            src={logo}
                            alt={title}
                            width='20px'
                            height='20px'
                            style={{ borderRadius: '50%' }}
                        />
                    )}
                </div>
                <FaAngleDown />
            </div>
            {dropdownMenuContent}
        </div>
    );
}
