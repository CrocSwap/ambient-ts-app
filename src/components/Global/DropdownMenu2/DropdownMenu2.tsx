import { useState, useRef, ReactNode } from 'react';
import { FaAngleDown } from 'react-icons/fa';
import { AnimatePresence } from 'framer-motion';
import { dropdownAnimation } from '../../../utils/others/FramerMotionAnimations';
import UseOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { MenuContainer, Menu, MenuItem, Icon } from './DropdownMenu2.styles';

// Interface for React functional components
interface DropdownMenuPropsIF {
    title: string;
    children: ReactNode;
    marginTop?: string;
    titleWidth?: string;
    logo?: string;
}

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
                <MenuContainer
                    onClick={() => setIsMenuOpen(false)}
                    variants={dropdownAnimation}
                    initial='hidden'
                    animate='show'
                    exit='hidden'
                    style={{ top: marginTop ? marginTop : '30px' }}
                >
                    {children}
                </MenuContainer>
            )}
        </AnimatePresence>
    );

    const desktopScreen = useMediaQuery('(min-width: 1020px)');

    return (
        <div ref={dropdownRefItem}>
            <Menu
                onClick={toggleMenu}
                style={{
                    minWidth: !desktopScreen
                        ? ''
                        : titleWidth
                        ? titleWidth
                        : '100px',
                }}
            >
                <MenuItem>
                    {desktopScreen && (
                        <Icon>
                            <img
                                src={logo}
                                alt={title}
                                width='18px'
                                height='18px'
                                style={{ borderRadius: '50%' }}
                            />
                            {title}
                        </Icon>
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
                </MenuItem>
                <FaAngleDown />
            </Menu>
            {dropdownMenuContent}
        </div>
    );
}
