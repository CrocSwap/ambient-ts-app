import styles from './NewNetworkSelector.module.css';
import { useState } from 'react';
import { motion, Variants } from 'framer-motion';

const itemVariants: Variants = {
    open: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
    closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

const mainVariant: Variants = {
    open: {
        clipPath: 'inset(0% 0% 0% 0% round 10px)',
        transition: {
            type: 'spring',
            bounce: 0,
            duration: 0.7,
            delayChildren: 0.3,
            staggerChildren: 0.05,
        },
    },
    closed: {
        clipPath: 'inset(10% 50% 90% 50% round 10px)',
        transition: {
            type: 'spring',
            bounce: 0,
            duration: 0.3,
        },
    },
};

const spring = {
    type: 'spring',
    stiffness: 500,
    damping: 30,
};

interface NetworkItemPropsIF {
    color: string;
    isSelected: boolean;
    name: string;
    onClick: () => void;
}

const networkItems = [
    {
        name: 'Network1',
        color: '#ff0055',
    },
    {
        name: 'Network2',
        color: '#0099ff',
    },
    {
        name: 'Network3',
        color: '#22cc88',
    },
    {
        name: 'Network4',
        color: '#ffaa00',
    },
    {
        name: 'Network5',
        color: 'yellow',
    },
];
export default function NewNetworkSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(networkItems[0]);

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

    function NetworkItem(props: NetworkItemPropsIF) {
        const { color, isSelected, onClick, name } = props;

        return (
            <motion.li
                className={styles.network_item_container}
                onClick={onClick}
                variants={itemVariants}
            >
                {name}
                <div className={styles.network_color} style={{ backgroundColor: color }}>
                    {isSelected && (
                        <motion.div
                            layoutId='outline'
                            className={styles.outline}
                            initial={false}
                            animate={{ borderColor: color }}
                            transition={spring}
                        />
                    )}
                </div>
            </motion.li>
        );
    }

    return (
        <motion.div initial={false} animate={isOpen ? 'open' : 'closed'} className={styles.menu}>
            <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsOpen(!isOpen)}
                className={styles.main_button}
            >
                Menu
                {dropdownMenuArrow}
            </motion.button>

            <motion.ul
                variants={mainVariant}
                style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
                className={styles.main_container}
            >
                {networkItems.map((network, idx) => (
                    <NetworkItem
                        name={network.name}
                        color={network.color}
                        key={idx}
                        isSelected={selected.color === network.color}
                        onClick={() => setSelected(network)}
                    />
                ))}
            </motion.ul>
        </motion.div>
    );
}
