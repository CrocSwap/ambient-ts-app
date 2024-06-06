import React, { useState } from 'react';
import { RxAvatar } from 'react-icons/rx';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import DistributionItem from './DistributionItem';
import styles from './Distribution.module.css';

interface Holder {
    walletId: string;
    percentage: string;
}

const holdersData: Holder[] = [
    { walletId: '0xAbCd...1234', percentage: '31.49%' },
    { walletId: '0xAbCd...1234', percentage: '21.05%' },
    { walletId: '0xAbCd...1234', percentage: '16.04%' },
    { walletId: '0xAbCd...1234', percentage: '9.91%' },
    { walletId: '0xAbCd...1234', percentage: '7.70%' },
    { walletId: '0xAbCd...1234', percentage: '5.50%' },
    { walletId: '0xAbCd...1234', percentage: '2.71%' },
    { walletId: '0xAbCd...1234', percentage: '1.44%' },
    { walletId: '0xAbCd...1234', percentage: '0.82%' },
];

const Distribution: React.FC = () => {
    const [holders] = useState(holdersData);
    const [isOpen, setIsOpen] = useState(false);

    const handleButtonClick = () => {
        setIsOpen(!isOpen);
    };

    const headerContent = (
        <div className={styles.headerContent} onClick={handleButtonClick}>
            <RxAvatar size={24} />
            <p className={styles.headerLabel}>Distribution</p>
            {isOpen ? <FaChevronDown size={24} /> : <FaChevronUp size={24} />}
        </div>
    );

    return (
        <div
            className={`${styles.container} ${
                isOpen ? styles.containerOpen : styles.containerClose
            }`}
        >
            <div
                className={styles.headerContent}
                onClick={handleButtonClick}
                style={{ opacity: isOpen ? '0' : '1' }}
            >
                <RxAvatar size={24} />
                <p className={styles.headerLabel}>Distribution</p>
                {isOpen ? (
                    <FaChevronDown size={24} />
                ) : (
                    <FaChevronUp size={24} />
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.distributionContainer}
                        initial={{
                            opacity: 1,
                            y: 20,
                            height: 0,
                            display: 'none',
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            height: '230px',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                        exit={{ opacity: 1, y: 20, display: 'none' }}
                        transition={{ duration: 0.2 }}
                    >
                        {headerContent}
                        <p className={styles.detailText}>
                            Distribution of holders in filled bid
                        </p>
                        <div className={styles.distributionContent}>
                            {holders.map((item, idx) => (
                                <DistributionItem
                                    key={idx + item.walletId + item.percentage}
                                    wallet={item.walletId}
                                    value={item.percentage}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Distribution;
