import styles from './FutaLanding.module.css';
import img from '../../../../assets/futa/home/key.svg';
export default function FutaLanding4() {
    return (
        <div className={styles.container}>
            <div className={styles.imageContainer}>
                <img src={img} alt='Key' className={styles.image} />
            </div>
            <div className={styles.info}>
                <pre className={styles.codeBlock}>
                    {
                        '{\n  UniqueTicker: true,\n  LockedLiquidity: true,\n  Ruggable: false,\n}'
                    }
                </pre>
                <p className={styles.text}>
                    By eliminating developer wallets and unaccounted supply, we
                    ensure a fair and transparent token ecosystem. This prevents
                    market manipulation and guarantees that all tokens are
                    distributed fairly. With no dev wallets, traders can trust
                    in the project&apos;s commitment to long-term stability and
                    security, reducing the risk of sudden dumps.
                </p>
            </div>
        </div>
    );
}
