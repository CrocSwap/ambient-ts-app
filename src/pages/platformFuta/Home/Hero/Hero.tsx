import { useEffect, useState } from 'react';
import FlashingSvg from '../Animations/FlashingSvg';
import TerminalAnimation from '../Animations/TerminalAnimation';
import SynthwaveGrid from '../Animations/SynthwaveGrid';
import styles from './Hero.module.css';
import { motion } from 'framer-motion';
import { BsSkipForward } from 'react-icons/bs';
import { IoMdClose } from 'react-icons/io';
import { useFutaHomeContext } from '../../../../contexts/Futa/FutaHomeContext';

interface PropsIF {
    onLearnClick: () => void;
}

export default function Hero(props: PropsIF) {
    const {
        setIsActionButtonVisible,
        showTerminal,
        setShowTerminal,
        hasVideoPlayedOnce,
        setHasVideoPlayedOnce,
        showHomeVideoLocalStorage,
        setShowHomeVideoLocalStorage,
    } = useFutaHomeContext();

    const { onLearnClick } = props;

    const [showSkipText, setShowSkipText] = useState(false);

    const handleSkipClick = () => {
        setHasVideoPlayedOnce(true);
        setShowSkipText(true);
    };

    useEffect(() => {
        if (showSkipText) {
            const timer = setTimeout(() => {
                setShowSkipText(false);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [showSkipText]);

    const hideAnimationNextTimeButton = (
        <motion.div
            className={styles.skipTextContainer}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
            <div className={styles.skipCloseIcon}>
                <IoMdClose size={20} onClick={() => setShowSkipText(false)} />
            </div>
            <div
                className={styles.skipText}
                onClick={() => setShowHomeVideoLocalStorage(false)}
            >
                {showHomeVideoLocalStorage
                    ? 'Click here to skip the animation next time'
                    : 'The animation will be skipped next time. You can change this anytime in the page header dropdown.'}
            </div>
        </motion.div>
    );

    useEffect(() => {
        if (!showHomeVideoLocalStorage) {
            setIsActionButtonVisible(true);
        } else if (!hasVideoPlayedOnce) {
            const timer = setTimeout(() => {
                setShowTerminal(false);
                setHasVideoPlayedOnce(true);
                setIsActionButtonVisible(true);
            }, 12000); // 12 seconds

            return () => clearTimeout(timer);
        }
    }, [hasVideoPlayedOnce, showHomeVideoLocalStorage, setHasVideoPlayedOnce]);

    const desktopDisplay = (
        <div>
            {hasVideoPlayedOnce || !showHomeVideoLocalStorage ? (
                <FlashingSvg onLearnClick={onLearnClick} />
            ) : showTerminal ? (
                <TerminalAnimation />
            ) : (
                <FlashingSvg onLearnClick={onLearnClick} />
            )}
            <SynthwaveGrid hasVideoPlayedOnce={hasVideoPlayedOnce} />

            {showTerminal &&
                !hasVideoPlayedOnce &&
                showHomeVideoLocalStorage && (
                    <BsSkipForward
                        size={30}
                        className={styles.skipIcon}
                        onClick={handleSkipClick}
                    />
                )}
            {showSkipText && hideAnimationNextTimeButton}
        </div>
    );
    return (
        <div className={styles.container}>
            {desktopDisplay}
            {/* <AnimatePresence>
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
                            <button
                                onClick={onLearnClick}
                                className={styles.learnButton}
                            >
                                Learn
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence> */}
        </div>
    );
}
