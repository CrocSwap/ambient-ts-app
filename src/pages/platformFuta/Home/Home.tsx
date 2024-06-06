import React from 'react';
import styles from './Home.module.css';
import bgVideo from '../../../assets/futa/landingPageCropped.mp4';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
function Home() {
    return (
        <div className={styles.container}>
            <h1>FUTA</h1>
            <video autoPlay muted loop className={styles.backgroundVideo}>
                <source src={bgVideo} type='video/mp4' />
                Your browser does not support the video tag.
            </video>
            <motion.div
                className={styles.content}
                initial='hidden'
                animate='visible'
                variants={containerVariants}
            >
                <motion.div variants={itemVariants}>
                    <Link to='/Explore' className={styles.exploreButton}>
                        Explore
                    </Link>
                </motion.div>
                <motion.div variants={itemVariants}>
                    <Link to='/Learn' className={styles.learnButton}>
                        Learn
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default Home;
