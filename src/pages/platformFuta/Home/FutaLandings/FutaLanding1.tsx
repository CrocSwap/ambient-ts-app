import styles from './FutaLanding.module.css';
import img from '../../../../assets/futa/home/gavel.svg';
export default function FutaLanding1() {
    return (
        <div className={styles.container}>
            <div
                className={`${styles.imageContainer} ${styles.keyImgContainer}`}
            >
                <img src={img} alt='Key' className={styles.image} />
            </div>
            <div className={styles.info}>
                <pre className={styles.codeBlock} style={{ display: 'none' }}>
                    {
                        '{\n  UniqueTicker: true,\n  LockedLiquidity: true,\n  Ruggable: false,\n}'
                    }
                </pre>
                <p className={styles.text}>
                    Our auction process ensures that every trader has an equal
                    opportunity to participate. Bids are placed in tranches,
                    with the largest fully filled bid becoming the active bid.
                    This transparent and competitive system ensures that tokens
                    are fairly priced based on actual demand, providing a level
                    playing field for all participants.
                </p>
            </div>
        </div>
    );
}
