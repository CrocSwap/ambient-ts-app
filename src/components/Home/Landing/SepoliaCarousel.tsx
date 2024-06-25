import React from 'react';
import styles from './SepoliaCarousel.module.css';

const images = [
    'https://cdn.prod.website-files.com/663ca72ea13862274743163b/664ee49b762bc75b5cbfbf27_2%2018.webp',
    'https://cdn.prod.website-files.com/663ca72ea13862274743163b/664ee76480d25cb5de31f89d_2%2019%20(1).webp',
    'https://cdn.prod.website-files.com/663ca72ea13862274743163b/664ee49b762bc75b5cbfbf27_2%2018.webp',
    'https://cdn.prod.website-files.com/663ca72ea13862274743163b/664ee76480d25cb5de31f89d_2%2019%20(1).webp',
    'https://cdn.prod.website-files.com/663ca72ea13862274743163b/664ee49b762bc75b5cbfbf27_2%2018.webp',
    'https://cdn.prod.website-files.com/663ca72ea13862274743163b/664ee76480d25cb5de31f89d_2%2019%20(1).webp',
];

const SepoliaCarousel: React.FC = () => {
    return (
        <div className={styles.carousel}>
            {images.map((src, index) => (
                <div
                    key={index}
                    className={`${styles.carouselList} ${styles.cloud} ${
                        index % 2 === 0 ? styles.first : styles.second
                    }`}
                >
                    <img
                        src={src}
                        loading='lazy'
                        sizes='(max-width: 1440px) 100vw, 1440px'
                        srcSet={`${src} 500w, ${src} 800w, ${src} 1440w`}
                        alt=''
                        className={styles.image}
                    />
                </div>
            ))}
        </div>
    );
};

export default SepoliaCarousel;
