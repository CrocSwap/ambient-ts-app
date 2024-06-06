import React from 'react';
import styles from './Home.module.css';
import bgVideo from '../../../assets/futa/landingPageCropped.mp4';
import { Link } from 'react-router-dom';
function Home() {
    return (
        <div className={styles.container}>
            <h1>FUTA</h1>
            <video autoPlay muted loop className={styles.backgroundVideo}>
                <source src={bgVideo} type='video/mp4' />
                Your browser does not support the video tag.
            </video>
            <div className={styles.content}>
                <Link to='/Explore' className={styles.exploreButton}>
                    Explore
                </Link>
                <Link to='/Learn' className={styles.learnButton}>
                    Learn
                </Link>
            </div>
        </div>
    );
}

export default Home;
