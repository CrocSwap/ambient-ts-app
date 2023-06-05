import styles from './MobileLandingSections.module.css';

import row2Image from '../../../assets/images/newHome/row2.png';
import row3Image from '../../../assets/images/newHome/row3.png';
import logoText from '../../../assets/images/logos/logo_text.png';

import Footer from '../../Footer/Footer';
import { useRef } from 'react';
import { BsChevronDown } from 'react-icons/bs';
import MobileHero from './MobileHero';
import Stats from '../Stats/AmbientStats';
import TradeNowButton from './TradeNowButton/TradeNowButton';
import TopPools from '../TopPools/TopPools';
import Investors from './Investors';
import { useTranslation } from 'react-i18next';
export default function MobileLandingSections() {
    const section1 = useRef(null);
    const section2 = useRef(null);
    const section3 = useRef(null);
    const section4 = useRef(null);
    const section5 = useRef(null);
    const section6 = useRef(null);
    const section7 = useRef(null);
    const section8 = useRef(null);

    const { t } = useTranslation();
    // eslint-disable-next-line
    function scrollTo(section: any) {
        section.current.scrollIntoView({ behavior: 'smooth' });
    }

    const heroSection = (
        <div className={`${styles.mobile_card} ${styles.hero} `} ref={section1}>
            <div>
                <div style={{ paddingBottom: '2rem' }}>
                    <img src={logoText} alt='ambient' />

                    <p className={styles.tagline}>
                        Zero-to-One Decentralized Trading Protocol.
                    </p>
                </div>
                <Stats />
            </div>
            <TradeNowButton />

            <button
                className={styles.scroll_button}
                onClick={() => scrollTo(section2)}
            >
                <BsChevronDown size={30} />
            </button>
        </div>
    );
    const topPoolsSection = (
        <div
            className={`${styles.mobile_card} ${styles.pools} `}
            ref={section2}
            style={{ width: '100vw' }}
        >
            <h3> {t('topPools')}</h3>
            <TopPools noTitle gap='8px' />

            <button
                className={styles.scroll_button}
                onClick={() => scrollTo(section3)}
            >
                <BsChevronDown size={30} />
            </button>
        </div>
    );

    const secondRow = (
        <div
            className={`${styles.mobile_card} ${styles.right_align}`}
            ref={section3}
        >
            <h1 tabIndex={0}>Zero-to-One Decentralized Trading Protocol</h1>
            <h2 tabIndex={0} style={{ color: 'var(--text2)' }}>
                Faster, Easier, and Cheaper
            </h2>
            <p tabIndex={0}>
                Ambient runs the entire DEX inside a single smart contract,
                allowing for low-fee transactions, greater liquidity rewards,
                and a fairer trading experience.
            </p>
            <button
                className={styles.scroll_button}
                onClick={() => scrollTo(section4)}
            >
                <BsChevronDown size={30} />
            </button>
        </div>
    );

    const thirdRow = (
        <div className={styles.mobile_card} ref={section4}>
            {/* <div className={styles.mobile_card_img_container_left}>
                <img src={row2Image} alt='concentrated and ambient liquidity' />
            </div> */}
            <h2 tabIndex={0}>Deep, Diversified Liquidity</h2>
            <p tabIndex={0}>
                Ambient is built for diversified, sustainable liquidity that
                fixes the broken LP economics of AMMs. It is also the only DEX
                to support concentrated (‘V3’), ambient (‘V2’) and knock-out
                liquidity in the same liquidity pool.
            </p>
            <button
                className={styles.scroll_button}
                onClick={() => scrollTo(section5)}
            >
                <BsChevronDown size={30} />
            </button>
        </div>
    );

    const fourthRow = (
        <div className={styles.mobile_card} ref={section5}>
            {/* <div className={styles.mobile_card_img_container_right}>
                <img
                    src={row3Image}
                    alt='range and limit orders'
                    width='90px'
                    className={styles.smaller_image}
                />
            </div> */}
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
            <button
                className={styles.scroll_button}
                onClick={() => scrollTo(section6)}
            >
                <BsChevronDown size={30} />
            </button>
        </div>
    );

    const fifthRow = (
        <div className={styles.mobile_card} ref={section6}>
            <h2 tabIndex={0}>Better than CEX</h2>
            <p tabIndex={0}>
                Built for traders and market makers of all kinds, Ambient
                introduces novel DeFi-native features and an array of
                quality-of-life improvements allowing for a best-in-class user
                experience.
            </p>
            <button
                className={styles.scroll_button}
                onClick={() => scrollTo(section7)}
            >
                <BsChevronDown size={30} />
            </button>
        </div>
    );

    const investorsSections = (
        <div
            className={`${styles.mobile_card} ${styles.investors}`}
            ref={section7}
        >
            <h3>Investors</h3>
            <Investors />
            <button
                className={styles.scroll_button}
                onClick={() => scrollTo(section8)}
            >
                <BsChevronDown size={30} />
            </button>
        </div>
    );

    const footerSection = (
        <div
            className={`${styles.mobile_card} ${styles.footer_section}`}
            ref={section8}
        >
            <Footer />
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
