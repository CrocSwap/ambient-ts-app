import { useState } from 'react';
import styles from './MobileSidebar.module.css';
import { motion } from 'framer-motion';
import { MenuButton } from '../MenuButton/MenuButton';
import MobileSidebarItem from './MobileSidebarItem';

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
