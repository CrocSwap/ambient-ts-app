import styles from './Landing4.module.css';
import ambientImage from '../../../assets/images/home/waveform_ambient.png';
import concentratedImage from '../../../assets/images/home/waveform_concentrated.png';
import combinedImage from '../../../assets/images/home/waveform_combined.png';
export default function Landing4() {
    const headerText = (
        <div className={styles.header_content}>
            <div className={styles.header_text}>
                <span className={styles.ambient_text}>ambient </span>
                combines liquidity in the
                <span className={styles.highlight_text}>same pool</span>
            </div>
            <div className={styles.amm_pools}>
                Meaning greater rewards for liquidity providers, and less price impact for traders
            </div>
        </div>
    );

    const ambientLiquidityContent = (
        <div className={styles.liquidity_content}>
            <div className={styles.content_title}>Ambient Liquidity</div>
            <div className={styles.content_text}>
                Provides capital across all prices, allowing for passive capital provision, at the
                cost of efficiency
            </div>
            <img src={ambientImage} alt='ambient liquidity' />
        </div>
    );
    const concentratedLiquidityContent = (
        <div className={styles.liquidity_content}>
            <div className={styles.content_title}>Concentrated Liquidity</div>
            <div className={styles.content_text}>
                Allows traders to provide liquidity within a specific range, meaning higher capital
                efficiency, but requires active management
            </div>
            <img src={concentratedImage} alt='concentrated liquidity' />
        </div>
    );
    const combinedLiquidityContent = (
        <div className={`${styles.liquidity_content} ${styles.liquidity_content_combined}`}>
            <div className={styles.content_title}>Combined Liquidity</div>
            <div className={styles.content_text}>
                Combining liquidity into the same pool reduces liquidity fragmentation and increases
                trade volume
            </div>
            <img src={combinedImage} alt='combined liquidity' />
        </div>
    );
    return (
        <div className={styles.main_container}>
            {headerText}
            <div className={styles.content_container}>
                <div className={styles.row}>
                    {ambientLiquidityContent}
                    {concentratedLiquidityContent}
                </div>
                {combinedLiquidityContent}
            </div>
        </div>
    );
}
