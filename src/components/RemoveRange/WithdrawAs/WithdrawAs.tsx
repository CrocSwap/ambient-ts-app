import styles from './WithdrawAs.module.css';
import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { BsCheckCircle } from 'react-icons/bs';
import { FiCircle } from 'react-icons/fi';
// import UseOnClickOutside from '../../../../utils/hooks/useOnClickOutside';

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

interface WithdrawAsPropsIF {
    isSelected: boolean;
    name: string;
    onClick: () => void;
}

const tokenChoices = [
    {
        name: 'ETH/USDC',
    },
    {
        name: 'ETH',
    },
    {
        name: 'USDC',
    },
];
export default function WithdrawAs() {
    // const menuRef = useRef<HTMLUListElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(tokenChoices[0]);
    // const clickOutsideHandler = () => {
    //     setIsOpen(false);
    // };
    // UseOnClickOutside(menuRef, clickOutsideHandler);

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

    function TokenItem(props: WithdrawAsPropsIF) {
        const { isSelected, onClick, name } = props;

        return (
            <motion.li
                className={styles.withdraw_item_container}
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

    const handleItemClick = (name: { name: string }) => {
        setSelected(name);
        setIsOpen(false);
    };
    return (
        <div className={styles.dropdown_row}>
            <p>Withdraw as</p>
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
                    // ref={menuRef}
                >
                    {tokenChoices.map((token, idx) => (
                        <TokenItem
                            name={token.name}
                            key={idx}
                            isSelected={selected.name === token.name}
                            onClick={() => handleItemClick(token)}
                        />
                    ))}
                </motion.ul>
            </motion.div>
        </div>
    );
}
