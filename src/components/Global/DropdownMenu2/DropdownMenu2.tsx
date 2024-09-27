import { useState, useRef, ReactNode, useContext, useEffect } from 'react';
import { FaAngleDown } from 'react-icons/fa';
import { dropdownAnimation } from '../../../utils/others/FramerMotionAnimations';
import UseOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { AppStateContext } from '../../../contexts/AppStateContext';
import useKeyPress from '../../../App/hooks/useKeyPress';
import { brand } from '../../../ambient-utils/constants';
import Modal from '../Modal/Modal';
import ModalHeader from '../ModalHeader/ModalHeader';
import styles from './DropdownMenu2.module.css'
import { motion } from 'framer-motion';
// Interface for React functional components
interface propsIF {
    title: string;
    children: ReactNode;
    marginTop?: string;
    marginRight?: string;
    marginLeft?: string;
    titleWidth?: string;
    logo?: string;
    left?: string;
    right?: string;
    expandable: boolean;
}

export default function DropdownMenu2(props: propsIF) {
    const {
        title,
        children,
        marginTop,
        titleWidth,
        logo,
        left,
        right,
        expandable,
        marginRight,
        marginLeft
    } = props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { appHeaderDropdown } = useContext(AppStateContext);
    const dropdownRefItem = useRef<HTMLDivElement>(null);
    const desktopScreen = useMediaQuery('(min-width: 1020px)');
    const showMobileVersion = useMediaQuery('(max-width: 768px)');
    const isEscapePressed = useKeyPress('Escape');
    useEffect(() => {
        if (isEscapePressed) {
            setIsMenuOpen(false);
            appHeaderDropdown.setIsActive(false);
        }
    }, [isEscapePressed]);

    function toggleMenu(): void {
        setIsMenuOpen(!isMenuOpen);
        // if (!isMenuOpen) {
        //     appHeaderDropdown.setIsActive(true);
        // } else appHeaderDropdown.setIsActive(false);
    }
    const clickOutsideHandler = () => {
        if (showMobileVersion) return null
        setIsMenuOpen(false);
    };

    UseOnClickOutside(dropdownRefItem, clickOutsideHandler);

    const dropdownMenuContent = (
        <motion.div className={styles.menuContainer}
            onClick={() => {
                setIsMenuOpen(false);
                appHeaderDropdown.setIsActive(false);
            }}
            variants={dropdownAnimation}
            initial='hidden'
            animate='show'
            exit='hidden'
            style={{
                top: marginTop ? marginTop : '30px',
                left: marginLeft ?? left,
                right: marginRight ?? right,
            }}
        >
            {children}
        </motion.div>
    );

 

    const showFullMenu = desktopScreen && brand !== 'futa';

    const modalVersion = (
        <Modal usingCustomHeader onClose={() => setIsMenuOpen(false)}>
            <ModalHeader title={'Select Network'} onClose={() => setIsMenuOpen(false)} />
            {dropdownMenuContent}
            </Modal>
    )

    return (
        <div ref={dropdownRefItem}>
            <div className={styles.menu}
                onClick={() => expandable && toggleMenu()}
                style={{
                    minWidth: !showFullMenu
                        ? ''
                        : titleWidth
                          ? titleWidth
                          : '100px',
                }}
            >
                <div className={styles.menuItem}>
                    {showFullMenu && (
                        <div className={styles.iconContainer}
                            style={{cursor: expandable ? 'pointer' : 'default'}}
                        >
                            <img
                                src={logo}
                                alt={title}
                                width={
                                    title.includes('Scroll') ||
                                    title.includes('Blast')
                                        ? '20px'
                                        : '20px'
                                }
                                height='20px'
                                style={{
                                    borderRadius: '50%',
                                    marginLeft: '2px',
                                }}
                            />
                            {title === 'Scroll Sepolia'
                                ? 'Scroll Testnet'
                                : title === 'Blast Sepolia'
                                  ? 'Blast Testnet'
                                  : title === 'Sepolia'
                                    ? 'Sepolia Testnet'
                                    : title}
                        </div>
                    )}
                    {!showFullMenu && (
                        <img
                            src={logo}
                            alt={title}
                            width='18px'
                            height='18px'
                            style={{
                                cursor: 'default',
                                borderRadius: '50%',
                                marginLeft: '2px',
                            }}
                        />
                    )}
                </div>
                {expandable && !showMobileVersion && (
                    <FaAngleDown
                        style={{ marginLeft: '4px', marginTop: '2px' }}
                    />
                )}
            </div>
            {isMenuOpen && (showMobileVersion ? modalVersion :  dropdownMenuContent)}
        </div>
    );
}
