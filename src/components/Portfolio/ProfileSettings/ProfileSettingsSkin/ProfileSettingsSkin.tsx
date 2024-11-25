import { motion, Variants } from 'framer-motion';
import { useState } from 'react';
import { BsCheckCircle } from 'react-icons/bs';
import { FiCircle } from 'react-icons/fi';
import styles from './ProfileSettingsSkin.module.css';

// const itemVariants: Variants = {
//     open: {
//         opacity: 1,
//         y: 0,
//         transition: { type: 'spring', stiffness: 300, damping: 24 },
//     },
//     closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
// };

const mainVariant: Variants = {
    open: {
        clipPath: 'inset(0% 0% 0% 0% round 4px)',
        transition: {
            type: 'spring',
            bounce: 0,
            duration: 0.7,
            delayChildren: 0.3,
            staggerChildren: 0.05,
        },
    },
    closed: {
        clipPath: 'inset(10% 50% 90% 50% round 4px)',
        transition: {
            type: 'spring',
            bounce: 0,
            duration: 0.3,
        },
    },
};

interface ProfileSettingSkinItemPropsIF {
    isSelected: boolean;
    name: string;
    onClick: () => void;
}

const skinItems = [
    {
        name: 'default',
        color: '#ff0055',
    },
    {
        name: 'win95',
        color: 'White',
    },
    {
        name: 'runescape',
        color: '#22cc88',
    },
    {
        name: '80s',
        color: '#22ccd88',
    },
];
export default function ProfileSettingsSkin() {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(skinItems[0]);

    const dropdownMenuArrow = (
        <motion.div
            variants={{
                open: { rotate: 180 },
                closed: { rotate: 0 },
            }}
            transition={{ duration: 0.2 }}
            style={{ originY: 0.55 }}
        >
            <svg width='15' height='15' viewBox='0 0 20 20'>
                <path d='M0 7 L 20 7 L 10 16' />
            </svg>
        </motion.div>
    );

    function SkinItem(props: ProfileSettingSkinItemPropsIF) {
        const { isSelected, onClick, name } = props;

        return (
            <motion.li
                className={styles.skin_item_container}
                onClick={onClick}
                // variants={itemVariants}
            >
                {name}
                {isSelected ? (
                    <BsCheckCircle size={24} color='#CDC1FF' />
                ) : (
                    <FiCircle size={24} color='#CDC1FF' />
                )}
            </motion.li>
        );
    }
    const handleItemClick = (skin: { name: string; color: string }) => {
        setSelected(skin);
        setIsOpen(false);
    };

    return (
        <motion.div
            initial={false}
            animate={isOpen ? 'open' : 'closed'}
            className={styles.menu}
        >
            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsOpen(!isOpen)}
                className={styles.main_button}
            >
                {selected.name}
                {dropdownMenuArrow}
            </motion.button>

            <motion.ul
                variants={mainVariant}
                style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
                className={styles.main_container}
            >
                {skinItems.map((skin, idx) => (
                    <SkinItem
                        name={skin.name}
                        key={idx}
                        isSelected={selected.color === skin.color}
                        onClick={() => handleItemClick(skin)}
                    />
                ))}
            </motion.ul>
        </motion.div>
    );
}
