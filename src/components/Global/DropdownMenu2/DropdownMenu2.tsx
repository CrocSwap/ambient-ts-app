import { useState, useRef, ReactNode, useContext, useEffect } from 'react';
import { FaAngleDown } from 'react-icons/fa';
import { dropdownAnimation } from '../../../utils/others/FramerMotionAnimations';
import UseOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { MenuContainer, Menu, MenuItem, Icon } from './DropdownMenu2.styles';
import { AppStateContext } from '../../../contexts/AppStateContext';
import useKeyPress from '../../../App/hooks/useKeyPress';
import { brand } from '../../../ambient-utils/constants';

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

    const isEscapePressed = useKeyPress('Escape');
    useEffect(() => {
        if (isEscapePressed) {
            setIsMenuOpen(false);
            appHeaderDropdown.setIsActive(false);
        }
    }, [isEscapePressed]);

    function toggleMenu(): void {
        setIsMenuOpen(!isMenuOpen);
        if (!isMenuOpen) {
            appHeaderDropdown.setIsActive(true);
        } else appHeaderDropdown.setIsActive(false);
    }
    const clickOutsideHandler = () => {
        setIsMenuOpen(false);
    };

    UseOnClickOutside(dropdownRefItem, clickOutsideHandler);

    const dropdownMenuContent = (
        <MenuContainer
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
        </MenuContainer>
    );

    const desktopScreen = useMediaQuery('(min-width: 1020px)');
    const showFullMenu = desktopScreen && brand !== 'futa';
    return (
        <div ref={dropdownRefItem}>
            <Menu
                alignItems='center'
                color='text1'
                gap={4}
                justifyContent='center'
                fullWidth
                onClick={() => expandable && toggleMenu()}
                style={{
                    minWidth: !showFullMenu
                        ? ''
                        : titleWidth
                          ? titleWidth
                          : '100px',
                }}
            >
                <MenuItem gap={4}>
                    {showFullMenu && (
                        <Icon
                            justifyContent='center'
                            alignItems='center'
                            expandable={expandable}
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
                        </Icon>
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
                </MenuItem>
                {expandable && (
                    <FaAngleDown
                        style={{ marginLeft: '4px', marginTop: '2px' }}
                    />
                )}
            </Menu>
            {isMenuOpen && dropdownMenuContent}
        </div>
    );
}
