import styles from './FutaLanding.module.css';
import img from '../../../../assets/futa/home/fingerprint.svg';
export default function FutaLanding2() {
    return (
        <div className={styles.container}>
            <div className={styles.imageContainer}>
                <img src={img} alt='Key' className={styles.image} width='60%' />
            </div>
            <div className={styles.info}>
                <pre className={styles.codeBlock}>
                    {'{\n  UniqueTicker: true,\n }'}
                </pre>
                <p className={styles.text}>
                    Every token gets a unique ticker to ensure it stands out.
                    This prevents confusion, reduces the risk of scams, and
                    makes trading straightforward. Unique tickers help build
                    strong token identities and provide a secure, transparent
                    environment for all traders.
                </p>
            </div>
        </div>
    );
}
