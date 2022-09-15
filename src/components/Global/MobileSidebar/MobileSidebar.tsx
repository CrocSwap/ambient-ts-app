import { useState } from 'react';
import styles from './MobileSidebar.module.css';
import { motion } from 'framer-motion';
import { MenuButton } from '../MenuButton/MenuButton';
import MobileSidebarItem from './MobileSidebarItem';
import { FaDiscord, FaGithub } from 'react-icons/fa';
import { BsMedium } from 'react-icons/bs';
import { AiFillTwitterCircle } from 'react-icons/ai';

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

    const socialIcons = (
        <div className={styles.social_container}>
            <a href='#'>
                <AiFillTwitterCircle size={20} />
                {/* <span>Twitter</span> */}
            </a>
            <a href='#'>
                <FaDiscord size={20} />
                {/* <span>Discord</span> */}
            </a>
            <a href='#'>
                <BsMedium size={20} />
                {/* <span>Medium</span> */}
            </a>
            <a href='#'>
                <FaGithub size={20} />
                {/* <span>Github</span> */}
            </a>
            <a href='#'>
                <FaGithub size={20} />
                {/* <span>Github</span> */}
            </a>
        </div>
    );

    const ecosystemDisplay = (
        <div className={styles.ecosystem_container}>
            <p>Build</p>
            <p>Blog</p>
            <p>Docs</p>
            <p>Governance</p>
            <p>Analytics</p>
            <p>Forum</p>
            <p>Grants</p>
        </div>
    );

    const dataToDisplay = (
        <motion.div variants={navigationVariants} className={styles.content}>
            {simpleData.map((item, idx) => (
                <MobileSidebarItem key={idx}>{item.name}</MobileSidebarItem>
            ))}
        </motion.div>
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
                    <MobileSidebarItem>{socialIcons}</MobileSidebarItem>
                    <MobileSidebarItem>{ecosystemDisplay}</MobileSidebarItem>
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
