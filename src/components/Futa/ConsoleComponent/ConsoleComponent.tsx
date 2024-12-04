import { motion } from 'framer-motion';
import Divider from '../Divider/FutaDivider';
import styles from './ConsoleComponent.module.css';
export default function ConsoleComponent() {
    // Animation Variants
    const containerVariants = {
        hidden: { height: 0, opacity: 0 },
        visible: {
            height: '',
            opacity: 1,
            transition: {
                duration: 0.3,
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
        exit: {
            height: 0,
            opacity: 0,
            transition: { duration: 0.3 },
        },
    };

    const containerItemVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0 },
    };

    const auctionData = [
        { time: '01:51', action: 'AUCTION CREATED', ticker: 'DOGE' },
        { time: '01:51', action: 'AUCTION CREATED', ticker: 'PEPE' },
        { time: '01:51', action: 'NEW OPEN BID', ticker: 'USA' },
        { time: '01:51', action: 'AUCTION COMPLETE', ticker: 'NOT' },
        { time: '01:51', action: 'BID TRANSACTION CONFIRMED', ticker: 'BODEN' },
        { time: '01:51', action: 'CLAIM TRANSACTION CONFIRMED', ticker: '-' },
        { time: '01:51', action: 'AUCTION CREATED', ticker: 'TRUMP' },
        { time: '01:51', action: 'NEW OPEN BID', ticker: 'USA' },
        { time: '01:51', action: 'BID TRANSACTION CONFIRMED', ticker: 'USA' },
    ];
    return (
        <div className={styles.container}>
            <Divider count={2} />
            <h3>console</h3>
            <motion.div
                className={styles.content}
                initial='hidden'
                animate='visible'
                exit='exit'
                variants={containerVariants}
            >
                {[...auctionData, ...auctionData].map((item) => (
                    <motion.div
                        className={styles.actionItem}
                        key={JSON.stringify(item)}
                        {...item}
                        variants={containerItemVariants}
                    >
                        <p>{item.time}</p>
                        <p
                            style={{
                                color: item.action
                                    .toLowerCase()
                                    .includes('confirmed')
                                    ? 'var(--accent1)'
                                    : 'var(--text1)',
                            }}
                        >
                            {item.action}
                        </p>
                        <p>{item.ticker}</p>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
