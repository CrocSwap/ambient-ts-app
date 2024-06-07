import React, { useEffect, useRef } from 'react';
import styles from './Home.module.css';
import bgVideo from '../../../assets/futa/landingPageCropped.mp4';
import bgVideoTrimmed from '../../../assets/futa/landingPageTrimmed.mp4';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

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
    const { hasVideoPlayedOnce, setHasVideoPlayedOnce } = props;
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const handleTimeUpdate = () => {
            if (videoRef.current && videoRef.current.currentTime >= 15) {
                setHasVideoPlayedOnce(true);
            }
        };

        if (videoRef.current) {
            videoRef.current.addEventListener('timeupdate', handleTimeUpdate);

            return () => {
                if (videoRef.current) {
                    videoRef.current.removeEventListener(
                        'timeupdate',
                        handleTimeUpdate,
                    );
                }
            };
        }
    }, [setHasVideoPlayedOnce]);

    return (
        <div className={styles.container}>
            <h1>FUTA</h1>
            {!hasVideoPlayedOnce ? (
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
            )}
            <AnimatePresence>
                <motion.div
                    className={styles.content}
                    initial='hidden'
                    animate='visible'
                    variants={containerVariants}
                >
                    <motion.div variants={itemVariants}>
                        <Link to='/auctions' className={styles.exploreButton}>
                            Explore
                        </Link>
                    </motion.div>
                    <motion.div variants={itemVariants}>
                        <Link to='/learn' className={styles.learnButton}>
                            Learn
                        </Link>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

export default Home;
