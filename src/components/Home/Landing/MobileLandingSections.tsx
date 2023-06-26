import styles from './MobileLandingSections.module.css';

import logoText from '../../../assets/images/logos/logo_text.png';

import Footer from '../../Footer/Footer';
import liquidityImage from '../../../assets/images/home/liquidity.png';
import orderImage from '../../../assets/images/home/orders.png';
import { Fade } from 'react-reveal';

import Stats from '../Stats/AmbientStats';
import TradeNowButton from './TradeNowButton/TradeNowButton';
import TopPools from '../TopPools/TopPools';
import Investors from './Investors';
import { useTranslation } from 'react-i18next';
export default function MobileLandingSections() {
    const { t } = useTranslation();
    // eslint-disable-next-line
    function scrollTo(section: any) {
        section.current.scrollIntoView({ behavior: 'smooth' });
    }

    const heroSection = (
        <div className={`${styles.mobile_card} ${styles.hero} `}>
            <>
                <div style={{ paddingBottom: '2rem' }}>
                    <img src={logoText} alt='ambient' />

                    <p className={styles.tagline}>
                        Zero-to-One Decentralized Trading Protocol.
                    </p>
                </div>
                <Stats />
            </>

            <TradeNowButton />
        </div>
    );
    const topPoolsSection = (
        <div
            className={`${styles.mobile_card} ${styles.pools} `}
            style={{ width: '100vw' }}
        >
            <>
                <h3> {t('topPools')}</h3>
                <TopPools noTitle gap='8px' />
            </>
        </div>
    );

    const secondRow = (
        <div className={`${styles.mobile_card} ${styles.right_align}`}>
            <Fade up>
                <h1 tabIndex={0}>Zero-to-One Decentralized Trading Protocol</h1>
                <h2 tabIndex={0} style={{ color: 'var(--text2)' }}>
                    Faster, Easier, and Cheaper
                </h2>
                <p tabIndex={0}>
                    Ambient runs the entire DEX inside a single smart contract,
                    allowing for low-fee transactions, greater liquidity
                    rewards, and a fairer trading experience.
                </p>
            </Fade>
        </div>
    );

    const thirdRow = (
        <div className={`${styles.mobile_card} ${styles.section4}`}>
            <Fade up>
                <img
                    src={liquidityImage}
                    alt='concentrated and ambient liquidity'
                    width='260px'
                />
                <h2 tabIndex={0}>Deep, Diversified Liquidity</h2>
                <p tabIndex={0}>
                    Ambient is built for diversified, sustainable liquidity that
                    fixes the broken LP economics of AMMs. It is also the only
                    DEX to support concentrated (‘V3’), ambient (‘V2’) and
                    knock-out liquidity in the same liquidity pool.
                </p>
            </Fade>
        </div>
    );

    const fourthRow = (
        <div className={`${styles.mobile_card} ${styles.section5}`}>
            <Fade up>
                <img
                    src={orderImage}
                    alt='range and limit orders'
                    width='200px'
                />

                <h2 tabIndex={0}>Bridge the Gap Between Trading and LP’ing</h2>
                <p tabIndex={0}>
                    Make your LP position a trading position – and vice versa –
                    using our range and limit orders.
                </p>
                <p tabIndex={0}>
                    Ambient combines liquidity in a single pool, allowing for
                    greater rewards for liquidity providers, and less impact for
                    traders.
                </p>
            </Fade>
        </div>
    );

    const fifthRow = (
        <div className={`${styles.mobile_card} ${styles.section6}`}>
            <Fade up>
                <h2 tabIndex={0}>Better than CEX</h2>
                <p tabIndex={0}>
                    Built for traders and market makers of all kinds, Ambient
                    introduces novel DeFi-native features and an array of
                    quality-of-life improvements allowing for a best-in-class
                    user experience.
                </p>
            </Fade>
        </div>
    );

    const investorsSections = (
        <div className={`${styles.mobile_card} ${styles.investors}`}>
            <Fade up>
                <h3>Investors</h3>
                <Investors />
            </Fade>
        </div>
    );

    const footerSection = (
        <div className={`${styles.mobile_card} ${styles.footer_section}`}>
            <Fade up>
                <Footer />
            </Fade>
        </div>
    );

    return (
        <div className={styles.main_container}>
            {heroSection}

            {topPoolsSection}

            {secondRow}

            {thirdRow}

            {fourthRow}

            {fifthRow}

            {investorsSections}

            {footerSection}
        </div>
    );
}
