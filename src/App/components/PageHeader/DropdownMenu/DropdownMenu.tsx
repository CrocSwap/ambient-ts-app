import styles from './DropdownMenu.module.css';
import { useState, useEffect, useRef } from 'react';
import '../../../App.css';
import { BiArrowBack } from 'react-icons/bi';
import { FiSettings, FiMoreHorizontal } from 'react-icons/fi';
import { CSSTransition } from 'react-transition-group';
import { FaNetworkWired, FaDiscord } from 'react-icons/fa';
import { MdHelp, MdArrowForwardIos } from 'react-icons/md';
import { motion } from 'framer-motion';

interface DropdownItemProps {
    goToMenu?: string;
    leftIcon?: React.ReactNode;
    topLevel?: boolean;
    goBackItem?: boolean;

    children: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export default function DropdownMenu() {
    const [activeMenu, setActiveMenu] = useState('main');
    const [menuHeight, setMenuHeight] = useState(null);
    const dropdownRef = useRef(null);

    // useEffect(() => {
    //     setMenuHeight(dropdownRef.current?.firstChild.offsetHeight);
    // }, []);

    // eslint-disable-next-line
    function calcHeight(el: any) {
        const height = el.offsetHeight;
        setMenuHeight(height);
    }

    function DropdownItem(props: DropdownItemProps) {
        const topLevelItemStyle = props.topLevel
            ? styles.topLevelContainer
            : styles.nonTopLevelContainer;
        const goBackItemStyle = props.goBackItem ? styles.goBackStyle : null;
        return (
            <>
                <a
                    href='#'
                    className={`${styles.menu_item} ${topLevelItemStyle} ${goBackItemStyle}`}
                    onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}
                >
                    <span className={styles.icon_button}>{props.leftIcon}</span>
                    {props.children}
                    <span className={styles.icon_right}>{props.rightIcon}</span>
                </a>
            </>
        );
    }

    const networksItems = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <DropdownItem>Kovan</DropdownItem>
            <DropdownItem>Ropsten</DropdownItem>
            <DropdownItem>Ethereum</DropdownItem>
            <DropdownItem>Polygon</DropdownItem>
            <DropdownItem leftIcon=''>Optimism</DropdownItem>
        </motion.div>
    );

    const socialsItems = (
        <>
            <DropdownItem>Twitter</DropdownItem>
            <DropdownItem>Discord</DropdownItem>
            <DropdownItem>Medium</DropdownItem>
            <DropdownItem>Github</DropdownItem>
        </>
    );

    const settingsItems = (
        <>
            <DropdownItem leftIcon=''>Light Mode</DropdownItem>
            <DropdownItem leftIcon=''>Language</DropdownItem>
            <DropdownItem leftIcon=''>Legal & Privacy</DropdownItem>
            <DropdownItem leftIcon=''>Logout</DropdownItem>
        </>
    );

    const supportItems = (
        <>
            <DropdownItem leftIcon=''>Help Center</DropdownItem>
            <DropdownItem leftIcon=''>Report a Problem</DropdownItem>
            <DropdownItem leftIcon=''>Request Features</DropdownItem>
        </>
    );

    const moreItems = (
        <>
            <DropdownItem leftIcon=''>About</DropdownItem>
            <DropdownItem leftIcon=''>Docs</DropdownItem>
        </>
    );

    const dropdownItemData = [
        {
            title: 'Networks',
            data: networksItems,
            leftIcon: <FaNetworkWired />,
        },
        {
            title: 'Settings & Privacy',
            data: settingsItems,
            leftIcon: <FiSettings />,
        },
        {
            title: 'Help & Support',
            data: supportItems,
            leftIcon: <MdHelp />,
        },
        {
            title: 'Socials',
            data: socialsItems,
            leftIcon: <FaDiscord />,
        },
        {
            title: 'More',
            data: moreItems,
            leftIcon: <FiMoreHorizontal />,
        },
    ];

    return (
        <div
            className={styles.dropdown}
            // style={{ height: menuHeight }}
            ref={dropdownRef}
        >
            <CSSTransition
                in={activeMenu === 'main'}
                unmountOnExit
                timeout={500}
                classNames='menu-primary'
                onEnter={calcHeight}
            >
                {/* Menu with each drop down item */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className={styles.menu}
                >
                    {dropdownItemData.map((item) => (
                        <DropdownItem
                            key={item.title}
                            leftIcon={item.leftIcon ? item.leftIcon : ''}
                            rightIcon={<MdArrowForwardIos />}
                            goToMenu={item.title}
                            topLevel
                        >
                            {item.title}
                        </DropdownItem>
                    ))}
                </motion.div>
            </CSSTransition>

            {/* Dropdown item datathat will slide in when clicked */}

            {dropdownItemData.map((item) => (
                <CSSTransition
                    in={activeMenu === item.title}
                    unmountOnExit
                    key={item.title}
                    timeout={500}
                    classNames='menu-secondary'
                    onEnter={calcHeight}
                >
                    <div className={styles.menu}>
                        <DropdownItem goToMenu='main' leftIcon={<BiArrowBack />} goBackItem>
                            <h3>{item.title}</h3>
                        </DropdownItem>
                        {item.data}
                    </div>
                </CSSTransition>
            ))}
        </div>
    );
}
