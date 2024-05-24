import { FlexContainer } from '../../../styled/Common';
import TopPools from '../TopPools/TopPools';
import AnimatedGradientPaths from './AnimatedGradientPaths';
import styles from './LandingStyles.module.css';
import TradeNowButton from './TradeNowButton/TradeNowButton';
export default function Landing1() {
    return (
        <div className={styles.hero_container}>
            <div className={styles.animated_paths}>
                <AnimatedGradientPaths />
            </div>
            <div className={styles.hero_heading}>
                <h2>
                    Zero-to-<span>One</span>{' '}
                </h2>
                <h2>Decentralized Trading Protocol</h2>
            </div>

            <p>
                Ambient is an entirely new kind of decentralized exchange
                combining unique DeFi native products with a user experience
                rivaling CEXes
            </p>

            <div className={styles.hero_stats_container}>
                <div className={styles.hero_stats}>
                    <p>Total TVL</p>
                    <h2> 30m</h2>
                </div>
                <div className={styles.hero_stats}>
                    <p>Total Fees</p>
                    <h2>600m</h2>
                </div>
                <div className={styles.hero_stats}>
                    <p>Total Volume</p>
                    <h2>350k</h2>
                </div>
            </div>
            <FlexContainer justifyContent='center'>
                <TradeNowButton fieldId='trade_now_btn_in_hero' />
            </FlexContainer>
            <TopPools />
        </div>
    );
}
