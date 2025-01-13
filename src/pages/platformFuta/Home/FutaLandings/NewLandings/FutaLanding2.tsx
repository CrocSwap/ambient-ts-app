import { useEffect, useState } from 'react';
import circleSvg from './Circle.svg';
import styles from './FutaLanding2.module.css';
export default function FutaLanding2() {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        // Function to update the width state
        const handleResize = () => {
            setWidth(window.innerWidth);
        };

        // Add event listener for window resize
        window.addEventListener('resize', handleResize);

        // Cleanup function to remove event listener
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        // <div className={styles.containerMain}>
        <div className={styles.container}>
            <div className={styles.content}>
                <p>{width > 1600 ? 'monitor' : 'laptop'}</p>
                <h3> width: {width}</h3>

                <h3>/Fair Auctions</h3>

                <p>Tickers are auctioned over a set period.</p>
                <p>
                    All participants in the winning bid get their token share at
                    the same price.
                </p>
                <p>
                    There is no way to snipe supply early, or any hidden supply.
                </p>
            </div>
            <div className={styles.imgContainer}>
                <img src={circleSvg} alt='circle svg' />
            </div>
        </div>
        // </div>
    );
}
