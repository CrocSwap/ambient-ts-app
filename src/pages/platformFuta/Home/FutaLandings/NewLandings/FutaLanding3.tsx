import DnaAnimation from '../../Animations/DnaAnimation';
import styles from './FutaLanding3.module.css';
export default function FutaLanding3() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h3>/Unique Tickers</h3>

                <p>There can only ever be 1 of each ticker.</p>
                <p>No more confusion over which is the “right” token.</p>
            </div>
            <div className={styles.videoContainer}>
                <DnaAnimation />
                {/* <img src={auctionSvg} alt="auction svg" /> */}
            </div>
        </div>
    );
}
