import styles from './Home1.module.css';
// import { Link } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import logoText from '../../../assets/images/logos/logo_text.svg';
import TradeNowButton from './TradeNowButton/TradeNowButton';
import row1Image from '../../../assets/images/newHome/row1.png';
import row2Image from '../../../assets/images/newHome/row2.png';
import row3Image from '../../../assets/images/newHome/row3.png';
export default function Home1() {
    // const { t } = useTranslation();

    const firstRow = (
        <div className={styles.slide_container}>
            <div className={styles.content_container}>
                <h1>Zero-to-One Decentralized Trading Protocol</h1>
                <TradeNowButton />
            </div>
        </div>
    );
    const secondRow = (
        <div className={styles.slide_container}>
            <div className={styles.row_container}>
                <section className={styles.faster_section}>
                    <h2>Faster, Easier, and Cheaper</h2>
                    <p>
                        Ambient runs the entire DEX inside a single smart contract, allowing for low
                        fee transactions, greater liquidity rewards, and a fairer trading
                        experience.
                    </p>
                    <TradeNowButton />
                </section>
                <img src={row1Image} alt='wallets' />
            </div>
        </div>
    );
    const thirdRow = (
        <div className={styles.slide_container}>
            <div className={`${styles.row_container} ${styles.column_reverse}`}>
                <img src={row2Image} alt='concentrated and ambient liquidity' />
                <section className={styles.faster_section}>
                    <h2>Deep, Diversified Liquidity</h2>
                    <p>
                        Ambient is built for diversified, sustainable liquidity that fixes the
                        broken LP economics of AMMs. It is also the only DEX to support concentrated
                        (‘V3’), ambient (‘V2’) and knock-out liquidity in the same liquidity pool.
                    </p>
                    <TradeNowButton />
                </section>
            </div>
        </div>
    );
    const fourthRow = (
        <div className={styles.slide_container}>
            <div className={styles.row_container}>
                <section className={styles.faster_section}>
                    <h2>Bridge the Gap Between Trading and LP’ing</h2>
                    <p>
                        Make your LP position a trading position – and vice versa – using our range
                        and limit orders.
                    </p>
                    <p>
                        Ambient combines liquidity in a single pool, allowing for greater rewards
                        for liquidity providers, and less impact for traders.
                    </p>
                    <TradeNowButton />
                </section>
                <img src={row3Image} alt='range and limit orders' />
            </div>
        </div>
    );
    const fifthRow = (
        <div className={styles.slide_container}>
            <div className={styles.row_container}>
                <div />
                <section className={styles.faster_section}>
                    <h2>Better than CEX</h2>
                    <p>
                        Built for traders and market makers of all kinds, Ambient introduces novel
                        DeFi-native features and an array of quality-of-life improvements allowing
                        for a best-in-class user experience.
                    </p>

                    <TradeNowButton />
                </section>
            </div>
        </div>
    );

    return (
        <div className={styles.main_container}>
            {firstRow}
            {secondRow}
            {thirdRow}
            {fourthRow}
            {fifthRow}
        </div>
    );
}
