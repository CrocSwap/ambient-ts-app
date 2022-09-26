import styles from './WithdrawTo.module.css';
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

interface WithdrawToPropsIF {
    isSelected: boolean;
    option: string;
    onClick: () => void;
}

const withdrawChoices = [
    {
        option: 'Wallet',
    },
    {
        option: 'Exchange',
    },
];
export default function WithdrawTo() {
    // const menuRef = useRef<HTMLUListElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(withdrawChoices[0]);
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

    function OptionItem(props: WithdrawToPropsIF) {
        const { isSelected, onClick, option } = props;

        return (
            <motion.li
                className={styles.withdraw_item_container}
                onClick={onClick}
                // variants={itemVariants}
            >
                {option}
                {isSelected ? (
                    <BsCheckCircle size={24} color='#CDC1FF' />
                ) : (
                    <FiCircle size={24} color='#CDC1FF' />
                )}
            </motion.li>
        );
    }

    const handleItemClick = (option: { option: string }) => {
        setSelected(option);
        setIsOpen(false);
    };
    return (
        <div className={styles.dropdown_row}>
            <p>Withdraw to</p>
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
                    {selected.option}
                    {dropdownMenuArrow}
                </motion.button>

                <motion.ul
                    variants={mainVariant}
                    style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
                    className={styles.main_container}
                    // ref={menuRef}
                >
                    {withdrawChoices.map((option, idx) => (
                        <OptionItem
                            option={option.option}
                            key={idx}
                            isSelected={selected.option === option.option}
                            onClick={() => handleItemClick(option)}
                        />
                    ))}
                </motion.ul>
            </motion.div>
        </div>
    );
}
