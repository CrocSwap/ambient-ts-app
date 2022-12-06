import { Dispatch, SetStateAction, useRef } from 'react';
import styles from './MobileSidebar.module.css';
import { motion } from 'framer-motion';
import { MenuButton } from '../MenuButton/MenuButton';
import MobileSidebarItem from './MobileSidebarItem';
import { FaDiscord, FaGithub } from 'react-icons/fa';
import { BsMedium, BsFillMoonStarsFill, BsFillSunFill, BsFillHeartFill } from 'react-icons/bs';
import { AiFillTwitterCircle } from 'react-icons/ai';
import { FiExternalLink } from 'react-icons/fi';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import ambientLogo from '../../../assets/images/logos/ambient_logo.svg';
import { Link } from 'react-router-dom';
import UseOnClickOutside from '../../../utils/hooks/useOnClickOutside';

const sidebar = {
    open: (height = 1000) => ({
        clipPath: `circle(${height * 2 + 200}px at 20px 20px)`,
        transition: {
            type: 'spring',
            stiffness: 20,
            restDelta: 2,
        },
    }),
    closed: {
        clipPath: 'circle(20px at 258px 20px)',
        transition: {
            delay: 0.5,
            type: 'spring',
            stiffness: 400,
            damping: 40,
        },
    },
};

interface MobileSidebarPropsIF {
    lastBlockNumber: number;
    isMobileSidebarOpen: boolean;
    setIsMobileSidebarOpen: Dispatch<SetStateAction<boolean>>;
    chainId: string;

    theme: string;
    switchTheme: () => void;
}

export default function MobileSidebar(props: MobileSidebarPropsIF) {
    const {
        lastBlockNumber,
        chainId,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        theme,
        switchTheme,
    } = props;

    const navigationVariants = {
        open: {
            transition: { staggerChildren: 0.07, delayChildren: 0.2 },
        },
        closed: {
            transition: { staggerChildren: 0.05, staggerDirection: -1 },
        },
    };

    const logoContainer = (
        <Link to='/' className={styles.logo_container}>
            <img src={ambientLogo} alt='ambient' width='35px' />
            <h1>ambient</h1>
        </Link>
    );
    const simpleData = [
        { name: 'User ENS Name' },
        { name: 'Wallet Balance' },
        { name: 'Surplus ' },
        { name: 'Settings ' },
        { name: 'Connect Wallet/ Logout ' },
    ];
    const dataToDisplay = (
        <motion.div variants={navigationVariants} className={styles.simple_data}>
            {simpleData.map((item, idx) => (
                <MobileSidebarItem key={idx}>{item.name}</MobileSidebarItem>
            ))}
        </motion.div>
    );

    const ecosystemData = [
        { name: 'Build', link: '#' },
        { name: 'Blog', link: '#' },
        { name: 'Docs', link: '#' },
        { name: 'Governance', link: '#' },
        { name: 'Analytics', link: '#' },
        { name: 'Forum', link: '#' },
    ];
    const ecosystemDisplay = (
        <motion.div variants={navigationVariants} className={styles.ecosystem_container}>
            <p>Ecosystem</p>
            {ecosystemData.map((item, idx) => (
                <MobileSidebarItem key={idx}>
                    <p>
                        {item.name}
                        <FiExternalLink size={10} />
                    </p>
                </MobileSidebarItem>
            ))}
        </motion.div>
    );

    const socialIconsData = [
        { icon: <AiFillTwitterCircle />, link: '#' },
        { icon: <FaDiscord />, link: '#' },
        { icon: <BsMedium />, link: '#' },
        { icon: <FaGithub />, link: '#' },
    ];
    const socialIconsDisplay = (
        <motion.div variants={navigationVariants} className={styles.social_container}>
            {socialIconsData.map((item, idx) => (
                <MobileSidebarItem key={idx}>
                    <a href={item.link}>{item.icon}</a>
                </MobileSidebarItem>
            ))}
        </motion.div>
    );

    const blockNumberDisplay = (
        <MobileSidebarItem>
            <div className={styles.block_number_container}>
                <div className={styles.page_block_sign} />
                <p> {lookupChain(chainId).displayName}:</p>
                <p>
                    Block {''}
                    {lastBlockNumber}
                </p>
            </div>
        </MobileSidebarItem>
    );

    const teamDisplay = (
        <MobileSidebarItem>
            <p className={styles.team_display}>
                With
                <p>{<BsFillHeartFill color='#c51104' />}</p>
                from the Ambient team
            </p>
        </MobileSidebarItem>
    );

    const appVersionDisplay = (
        <MobileSidebarItem>
            <div className={styles.version_display}>
                <p>App:</p>
                <p>v1.0.0</p>
                <FiExternalLink size={10} color='#555555' />
            </div>
        </MobileSidebarItem>
    );
    const themeTogglerDisplay = (
        <MobileSidebarItem>
            <div
                className={`${styles.theme_toggler_content} ${
                    theme === 'light' && styles.theme_toggler_light
                }`}
                onClick={switchTheme}
            >
                {theme === 'light' ? (
                    <BsFillMoonStarsFill color='#f0c420' />
                ) : (
                    <BsFillSunFill color='#f9d71c' />
                )}
                <p>{theme === 'light' ? 'Dark mode' : 'Light mode'}</p>
            </div>
        </MobileSidebarItem>
    );

    // this button stays on the right hand side of the page to close the menu
    const closeMenuButton = (
        <div className={styles.toggle_button_close}>
            <MenuButton
                isOpen={true}
                onClick={() => setIsMobileSidebarOpen(false)}
                strokeWidth='2'
                color='#ebebff'
                transition={{ ease: 'easeOut', duration: 0.2 }}
                width='24'
                height='18'
            />
        </div>
    );
    const sidebarMenuRef = useRef<HTMLDivElement>(null);
    const clickOutsideHandler = () => {
        setIsMobileSidebarOpen(false);
    };
    UseOnClickOutside(sidebarMenuRef, clickOutsideHandler);

    return (
        <>
            <motion.nav
                ref={sidebarMenuRef}
                className={styles.main_container}
                initial={false}
                animate={isMobileSidebarOpen ? 'open' : 'closed'}
                custom='100%'
            >
                <motion.div
                    className={`${styles.container} ${
                        isMobileSidebarOpen && styles.container_open
                    }`}
                    variants={sidebar}
                >
                    {logoContainer}
                    <div className={styles.content}>
                        <section>{dataToDisplay}</section>
                        <section>{ecosystemDisplay}</section>
                        <section>
                            {themeTogglerDisplay}
                            {socialIconsDisplay}
                            {lastBlockNumber && blockNumberDisplay}
                            {appVersionDisplay}
                            {teamDisplay}
                        </section>
                    </div>
                </motion.div>
            </motion.nav>
            {!isMobileSidebarOpen && (
                <div className={styles.toggle_button}>
                    <MenuButton
                        isOpen={isMobileSidebarOpen}
                        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                        strokeWidth='2'
                        color='#7371fc'
                        transition={{ ease: 'easeOut', duration: 0.2 }}
                        width='24'
                        height='18'
                    />
                </div>
            )}
            {isMobileSidebarOpen && closeMenuButton}
        </>
    );
}

// https://codesandbox.io/s/framer-motion-side-menu-mx2rw?from-embed=&file=/src/use-dimensions.ts
