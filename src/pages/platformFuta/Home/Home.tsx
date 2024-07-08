import React, { useEffect, useState } from 'react';
import styles from './Home.module.css';

import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import SynthwaveGrid from './Animations/SynthwaveGrid';
import TerminalAnimation from './Animations/TerminalAnimation';
import FlashingSvg from './Animations/FlashingSvg';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
};

interface PropsIF {
    setHasVideoPlayedOnce: React.Dispatch<React.SetStateAction<boolean>>;
    hasVideoPlayedOnce: boolean;
}

function Home(props: PropsIF) {
    const { hasVideoPlayedOnce, setHasVideoPlayedOnce } = props;

    const [isActionButtonVisible, setIsActionButtonVisible] = useState(false);
    const [showTerminal, setShowTerminal] = useState(true);

    useEffect(() => {
        if (!hasVideoPlayedOnce) {
            const timer = setTimeout(() => {
                setShowTerminal(false);
                setHasVideoPlayedOnce(true);
                setIsActionButtonVisible(true);
            }, 12000); // 11 seconds

            return () => clearTimeout(timer);
        } else {
            setIsActionButtonVisible(true);
        }
    }, [hasVideoPlayedOnce, setHasVideoPlayedOnce]);

    const desktopDisplay = (
        <div>
            {hasVideoPlayedOnce ? (
                <FlashingSvg />
            ) : showTerminal ? (
                <TerminalAnimation />
            ) : (
                <FlashingSvg />
            )}
            <SynthwaveGrid hasVideoPlayedOnce={hasVideoPlayedOnce} />
        </div>
    );

    return (
        <div className={styles.container}>
            {desktopDisplay}
            <AnimatePresence>
                {isActionButtonVisible && (
                    <motion.div
                        className={styles.content}
                        initial='hidden'
                        animate='visible'
                        variants={containerVariants}
                    >
                        <motion.div variants={itemVariants}>
                            <Link
                                to='/auctions'
                                className={styles.exploreButton}
                            >
                                Explore
                            </Link>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <Link to='/learn' className={styles.learnButton}>
                                Learn
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Home;
