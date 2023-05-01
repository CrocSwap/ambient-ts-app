import styles from './Home1.module.css';
// import { Link } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import logoText from '../../../assets/images/logos/logo_text.svg';
import row2Image from '../../../assets/images/newHome/row2.png';
import row3Image from '../../../assets/images/newHome/row3.png';
import Investors from './Investors';
import Footer from '../../Footer/Footer';
import TradeNowButton from './TradeNowButton/TradeNowButton';
export default function Home1() {
    // const { t } = useTranslation();

    const secondRow = (
        <div className={`${styles.slide_container} ${styles.height_medium}`}>
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
    const thirdRow = (
        <div className={`${styles.slide_container} ${styles.height_large}`}>
            <div className={`${styles.row_container} ${styles.column_reverse}`}>
                <img
                    src={row2Image}
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
    const fourthRow = (
        <div className={`${styles.slide_container} ${styles.height_large}`}>
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
                    src={row3Image}
                    alt='range and limit orders'
                    width='240px'
                    height='420px'
                />
            </div>
        </div>
    );
    const fifthRow = (
        <div className={`${styles.slide_container} ${styles.height_large}`}>
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

    return (
        <div className={styles.main_container}>
            {secondRow}
            {thirdRow}
            {fourthRow}
            {fifthRow}
            <Investors />
            <Footer />
        </div>
    );
}
