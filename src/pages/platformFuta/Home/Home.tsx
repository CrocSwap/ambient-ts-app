import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Home.module.css';
import bgVideo from '../../../assets/futa/landingPageCropped.mp4';
import bgVideoTrimmed from '../../../assets/futa/landingPageTrimmed.mp4';
import futaIntro from '../../../assets/futa/futaIntro.mp4';
import futaTrimmed from '../../../assets/futa/futaIntroCropped.mp4';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3, // Stagger the appearance of child elements
            delayChildren: 0.2, // Delay before children start appearing
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
    const showMobileVersion = useMediaQuery('(max-width: 560px)');

    const { hasVideoPlayedOnce, setHasVideoPlayedOnce } = props;
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoRefDesktop = useRef<HTMLVideoElement>(null);
    const [isActionButtonVisible, setIsActionButtonVisible] = useState(false);

    const videoRefToUse = showMobileVersion ? videoRef : videoRefDesktop;

    const handleTimeUpdate = useCallback(() => {
        if (
            videoRefToUse.current &&
            videoRefToUse.current.currentTime >= (showMobileVersion ? 15 : 11)
        ) {
            setHasVideoPlayedOnce(true);
        }
    }, [setHasVideoPlayedOnce]);
    useEffect(() => {
        if (videoRefToUse.current) {
            videoRefToUse.current.addEventListener(
                'timeupdate',
                handleTimeUpdate,
            );

            return () => {
                videoRefToUse.current &&
                    videoRefToUse.current.removeEventListener(
                        'timeupdate',
                        handleTimeUpdate,
                    );
            };
        }
    }, [handleTimeUpdate]);

    useEffect(() => {
        if (hasVideoPlayedOnce) setIsActionButtonVisible(true);
        const timer = setTimeout(() => {
            setIsActionButtonVisible(true);
        }, 11000);

        return () => clearTimeout(timer);
    }, [hasVideoPlayedOnce]);

    const mobileVideo = !hasVideoPlayedOnce ? (
        <video
            ref={videoRef}
            autoPlay
            muted
            loop
            className={styles.backgroundVideo}
        >
            <source src={bgVideo} type='video/mp4' />
            Your browser does not support the video tag.
        </video>
    ) : (
        <video autoPlay muted loop className={styles.backgroundVideo}>
            <source src={bgVideoTrimmed} type='video/mp4' />
            Your browser does not support the video tag.
        </video>
    );

    const desktopVideo = !hasVideoPlayedOnce ? (
        <video
            ref={videoRefDesktop}
            autoPlay
            muted
            loop
            className={styles.backgroundVideo}
        >
            <source src={futaIntro} type='video/mp4' />
            Your browser does not support the video tag.
        </video>
    ) : (
        <video autoPlay muted loop className={styles.backgroundVideo}>
            <source src={futaTrimmed} type='video/mp4' />
            Your browser does not support the video tag.
        </video>
    );

    return (
        <div className={styles.container}>
            {showMobileVersion ? mobileVideo : desktopVideo}
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
