import styles from './MobileLandingSections.module.css';

import row2Image from '../../../assets/images/newHome/row2.png';
import row3Image from '../../../assets/images/newHome/row3.png';
import Footer from '../../Footer/Footer';
import { useRef } from 'react';

export default function MobileLandingSections() {
    const section1 = useRef(null);
    const section2 = useRef(null);
    const section3 = useRef(null);
    const section4 = useRef(null);
    // eslint-disable-next-line
    function scrollTo(section: any) {
        section.current.scrollIntoView({ behavior: 'smooth' });
    }

    const secondRow = (
        <div className={styles.mobile_card} ref={section1}>
            <h1 tabIndex={0}>Zero-to-One Decentralized Trading Protocol</h1>
            <h2 tabIndex={0} style={{ color: 'var(--text2)' }}>
                Faster, Easier, and Cheaper
            </h2>
            <p tabIndex={0}>
                Ambient runs the entire DEX inside a single smart contract,
                allowing for low-fee transactions, greater liquidity rewards,
                and a fairer trading experience.
            </p>
            <button onClick={() => scrollTo(section2)}>Scroll</button>
        </div>
    );

    const thirdRow = (
        <div className={styles.mobile_card} ref={section2}>
            <div className={styles.mobile_card_img_container_left}>
                <img src={row2Image} alt='concentrated and ambient liquidity' />
            </div>
            <h2 tabIndex={0}>Deep, Diversified Liquidity</h2>
            <p tabIndex={0}>
                Ambient is built for diversified, sustainable liquidity that
                fixes the broken LP economics of AMMs. It is also the only DEX
                to support concentrated (‘V3’), ambient (‘V2’) and knock-out
                liquidity in the same liquidity pool.
            </p>
            <button onClick={() => scrollTo(section3)}>Scroll</button>
        </div>
    );

    const fourthRow = (
        <div className={styles.mobile_card} ref={section3}>
            <div className={styles.mobile_card_img_container_right}>
                <img
                    src={row3Image}
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
            <button onClick={() => scrollTo(section4)}>Scroll</button>
        </div>
    );

    const fifthRow = (
        <div className={styles.mobile_card} ref={section4}>
            <h2 tabIndex={0}>Better than CEX</h2>
            <p tabIndex={0}>
                Built for traders and market makers of all kinds, Ambient
                introduces novel DeFi-native features and an array of
                quality-of-life improvements allowing for a best-in-class user
                experience.
            </p>
            {/* <button onClick={() => scrollTo(section5)}>Scroll</button> */}
        </div>
    );

    return (
        <div className={styles.main_container}>
            {secondRow}
            {thirdRow}
            {fourthRow}

            {fifthRow}

            <Footer />
        </div>
    );
}
