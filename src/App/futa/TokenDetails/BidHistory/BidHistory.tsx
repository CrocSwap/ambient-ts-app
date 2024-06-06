import React, { useState } from 'react';
import { LuHistory } from 'react-icons/lu';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import BidItem from './BidItem';
import styles from './BidHistory.module.css';

export interface Bid {
    fdvValue: string | number;
    dollarValue: string | number;
}

const bidHistoryData: Bid[] = [
    { fdvValue: '15,000', dollarValue: '1500' },
    { fdvValue: '10,000', dollarValue: '500' },
    { fdvValue: '4,000', dollarValue: '900' },
    { fdvValue: '1,000', dollarValue: '200' },
    { fdvValue: '5,000', dollarValue: '800' },
    { fdvValue: '3,000', dollarValue: '400' },
    { fdvValue: '6,000', dollarValue: '100' },
    { fdvValue: '1,000', dollarValue: '300' },
    { fdvValue: '2,000', dollarValue: '600' },
    { fdvValue: '2,000', dollarValue: '600' },
    { fdvValue: '2,000', dollarValue: '600' },
    { fdvValue: '2,000', dollarValue: '600' },
];

const BidHistory: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [bids, setBids] = useState(bidHistoryData);

    const handleRemoveBid = (index: number) => {
        setBids(bids.filter((_, idx) => idx !== index));
    };

    const handleButtonClick = () => {
        setIsOpen(!isOpen);
    };

    const headerContent = (
        <div className={styles.headerContent} onClick={handleButtonClick}>
            <LuHistory size={24} />
            <p className={styles.headerLabel}>Bid History</p>
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
                <LuHistory size={24} />
                <p className={styles.headerLabel}>Bid History</p>
                {isOpen ? (
                    <FaChevronDown size={24} />
                ) : (
                    <FaChevronUp size={24} />
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className={styles.bidHistoryContainer}
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
                        <div style={{ padding: '0 16px' }}>
                            <button
                                className={styles.removeAllButton}
                                onClick={() => setBids([])}
                            >
                                Remove all previous bids
                            </button>
                        </div>
                        <div className={styles.bidHistoryContent}>
                            {bids.map((item, idx) => (
                                <BidItem
                                    key={idx}
                                    fdvValue={item.fdvValue}
                                    dollarValue={item.dollarValue}
                                    onRemove={() => handleRemoveBid(idx)}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BidHistory;
