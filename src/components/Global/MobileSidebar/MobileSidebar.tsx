import { useState } from 'react';
import styles from './MobileSidebar.module.css';
import { motion } from 'framer-motion';
import { MenuButton } from '../MenuButton/MenuButton';
import MobileSidebarItem from './MobileSidebarItem';
import { FaDiscord, FaGithub } from 'react-icons/fa';
import { BsMedium, BsFillMoonStarsFill, BsFillSunFill } from 'react-icons/bs';
import { AiFillTwitterCircle } from 'react-icons/ai';
import { FiExternalLink } from 'react-icons/fi';
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

export default function MobileSidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const navigationVariants = {
        open: {
            transition: { staggerChildren: 0.07, delayChildren: 0.2 },
        },
        closed: {
            transition: { staggerChildren: 0.05, staggerDirection: -1 },
        },
    };
    const simpleData = [
        { name: 'User ENS Name' },
        { name: 'Wallet Balance' },
        { name: 'Surplus ' },
        { name: 'Settings ' },
        { name: 'Connect Wallet/ Logout ' },
    ];
    const dataToDisplay = (
        <motion.div variants={navigationVariants} className={styles.content}>
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
            {ecosystemData.map((item, idx) => (
                <MobileSidebarItem key={idx}>
                    <p>
                        {item.name}
                        <FiExternalLink size={10} color='#555555' />
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

    const [lightMode, setLightMode] = useState(true);
    const themeTogglerDisplay = (
        <MobileSidebarItem>
            <div
                className={styles.theme_toggler_container}
                onClick={() => setLightMode(!lightMode)}
            >
                <div
                    className={`${styles.theme_toggler_content} ${
                        lightMode && styles.theme_toggler_light
                    }`}
                >
                    {lightMode ? (
                        <BsFillMoonStarsFill color='#f0c420' />
                    ) : (
                        <BsFillSunFill color='#f9d71c' />
                    )}
                    <p>{lightMode ? 'Dark mode' : 'Light mode'}</p>
                </div>
            </div>
        </MobileSidebarItem>
    );

    return (
        <>
            <motion.nav
                className={styles.main_container}
                initial={false}
                animate={isOpen ? 'open' : 'closed'}
                custom='100%'
            >
                <motion.div
                    className={`${styles.container} ${isOpen && styles.container_open}`}
                    variants={sidebar}
                >
                    {dataToDisplay}
                    {ecosystemDisplay}
                    {themeTogglerDisplay}
                    {socialIconsDisplay}
                </motion.div>
            </motion.nav>

            <div className={styles.toggle_button}>
                <MenuButton
                    isOpen={isOpen}
                    onClick={() => setIsOpen(!isOpen)}
                    strokeWidth='2'
                    color='#7371fc'
                    transition={{ ease: 'easeOut', duration: 0.2 }}
                    width='24'
                    height='18'
                />
            </div>
        </>
    );
}

// https://codesandbox.io/s/framer-motion-side-menu-mx2rw?from-embed=&file=/src/use-dimensions.ts
