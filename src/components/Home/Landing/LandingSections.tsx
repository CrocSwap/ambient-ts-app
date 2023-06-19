import styles from './LandingSections.module.css';

import liquidityImage from '../../../assets/images/home/liquidity.png';
import orderImage from '../../../assets/images/home/orders.png';
import Investors from './Investors';
import Footer from '../../Footer/Footer';
import TradeNowButton from './TradeNowButton/TradeNowButton';
import bg1 from '../../../assets/images/home/home2.png';
import bg2 from '../../../assets/images/home/home3.png';
import bg3 from '../../../assets/images/home/home4.png';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';

export default function LandingSections() {
    const showMobileVersion = useMediaQuery('(max-width: 600px)');

    const secondRowDefault = (
        <div
            className={`${styles.slide_container} ${styles.height_medium} ${styles.home2}`}
        >
            <div className={styles.row_container}>
                <section className={styles.faster_section}>
                    <h1 tabIndex={0}>
                        Zero-to-One Decentralized Trading Protocol
                    </h1>
                    <h2 tabIndex={0}>Faster, Easier, and Cheaper</h2>
                    <p tabIndex={0}>
                        Ambient runs the entire DEX inside a single smart
                        contract, allowing for low-fee transactions, greater
                        liquidity rewards, and a fairer trading experience.
                    </p>
                    <TradeNowButton />
                </section>
            </div>
        </div>
    );
    const secondRowMobile = (
        <div className={styles.mobile_card}>
            <h1 tabIndex={0}>Zero-to-One Decentralized Trading Protocol</h1>
            <h2 tabIndex={0} style={{ color: 'var(--text2)' }}>
                Faster, Easier, and Cheaper
            </h2>
            <p tabIndex={0}>
                Ambient runs the entire DEX inside a single smart contract,
                allowing for low-fee transactions, greater liquidity rewards,
                and a fairer trading experience.
            </p>
        </div>
    );
    const secondRow = showMobileVersion ? secondRowMobile : secondRowDefault;
    const thirdRowDefault = (
        <div className={`${styles.slide_container} ${styles.height_large}`}>
            <div className={`${styles.row_container} ${styles.column_reverse}`}>
                <img
                    src={liquidityImage}
                    alt='concentrated and ambient liquidity'
                    width='331px'
                    height='420px'
                />
                <section className={styles.faster_section}>
                    <h2 tabIndex={0}>Deep, Diversified Liquidity</h2>
                    <p tabIndex={0}>
                        Ambient is built for diversified, sustainable liquidity
                        that fixes the broken LP economics of AMMs. It is also
                        the only DEX to support concentrated (‘V3’), ambient
                        (‘V2’) and knock-out liquidity in the same liquidity
                        pool.
                    </p>
                </section>
            </div>
        </div>
    );

    const thirdRowMobile = (
        <div className={styles.mobile_card}>
            <div className={styles.mobile_card_img_container_left}>
                <img
                    src={liquidityImage}
                    alt='concentrated and ambient liquidity'
                />
            </div>
            <h2 tabIndex={0}>Deep, Diversified Liquidity</h2>
            <p tabIndex={0}>
                Ambient is built for diversified, sustainable liquidity that
                fixes the broken LP economics of AMMs. It is also the only DEX
                to support concentrated (‘V3’), ambient (‘V2’) and knock-out
                liquidity in the same liquidity pool.
            </p>
        </div>
    );
    const thirdRow = showMobileVersion ? thirdRowMobile : thirdRowDefault;

    const fourthRowDefault = (
        <div
            className={`${styles.slide_container} ${styles.height_large} ${styles.home3}`}
        >
            <div className={styles.row_container}>
                <section className={styles.faster_section}>
                    <h2 tabIndex={0}>
                        Bridge the Gap Between Trading and LP’ing
                    </h2>
                    <p tabIndex={0}>
                        Make your LP position a trading position – and vice
                        versa – using our range and limit orders.
                    </p>
                    <p tabIndex={0}>
                        Ambient combines liquidity in a single pool, allowing
                        for greater rewards for liquidity providers, and less
                        impact for traders.
                    </p>
                </section>
                <img
                    src={orderImage}
                    alt='range and limit orders'
                    width='240px'
                    height='420px'
                />
            </div>
        </div>
    );
    const fourthRowMobile = (
        <div className={styles.mobile_card}>
            <div className={styles.mobile_card_img_container_right}>
                <img
                    src={orderImage}
                    alt='range and limit orders'
                    width='90px'
                    className={styles.smaller_image}
                />
            </div>
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
        </div>
    );
    const fourthRow = showMobileVersion ? fourthRowMobile : fourthRowDefault;

    const fifthRowDefault = (
        <div
            className={`${styles.slide_container} ${styles.height_large} ${styles.home4}`}
        >
            <div className={styles.row_container}>
                <div />
                <section className={styles.faster_section}>
                    <h2 tabIndex={0}>Better than CEX</h2>
                    <p tabIndex={0}>
                        Built for traders and market makers of all kinds,
                        Ambient introduces novel DeFi-native features and an
                        array of quality-of-life improvements allowing for a
                        best-in-class user experience.
                    </p>
                    <TradeNowButton />
                </section>
            </div>
        </div>
    );

    const fifthRowMobile = (
        <div className={styles.mobile_card}>
            <h2 tabIndex={0}>Better than CEX</h2>
            <p tabIndex={0}>
                Built for traders and market makers of all kinds, Ambient
                introduces novel DeFi-native features and an array of
                quality-of-life improvements allowing for a best-in-class user
                experience.
            </p>
        </div>
    );

    const fifthRow = showMobileVersion ? fifthRowMobile : fifthRowDefault;

    return (
        <div className={styles.main_container}>
            <img src={bg1} alt='' className={styles.bg1} />
            <img src={bg2} alt='' className={styles.bg2} />
            <img src={bg3} alt='' className={styles.bg3} />

            {secondRow}
            {thirdRow}
            {fourthRow}

            {fifthRow}

            {!showMobileVersion && <Investors />}
            <Footer />
        </div>
    );
}
