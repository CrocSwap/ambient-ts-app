import styles from './FutaLanding.module.css';
import img from '../../../../assets/futa/home/padlock.svg';
export default function FutaLanding3() {
    return (
        <div className={styles.container}>
            <div className={styles.imageContainer}>
                <img src={img} alt='Key' className={styles.image} />
            </div>
            <div className={styles.info}>
                <pre className={styles.codeBlock}>
                    {'{\n  UniqueTicker: true,\n  LockedLiquidity: true,\n  }'}
                </pre>
                <p className={styles.text}>
                    Futa Finance locks liquidity for each token to enhance
                    market stability and build investor trust. By preventing
                    sudden withdrawals by developers, locked liquidity reduces
                    the risk of rug pulls and ensures a stable trading
                    environment.
                </p>
            </div>
        </div>
    );
}
