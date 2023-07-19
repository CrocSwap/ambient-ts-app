import blocktower from '../../../assets/images/investors/blocktower.svg';
import jane from '../../../assets/images/investors/jane.svg';
import circle from '../../../assets/images/investors/circle.svg';
import tensai from '../../../assets/images/investors/tensai.png';
import naval from '../../../assets/images/investors/naval.svg';
import yunt from '../../../assets/images/investors/yunt.svg';
import susa from '../../../assets/images/investors/susa.svg';
import quantstamp from '../../../assets/images/investors/quantstamp.svg';
import hypotenuse from '../../../assets/images/investors/hypotenuse.svg';
import PositiveSum from '../../../assets/images/investors/positivesum.svg';
import motivate from '../../../assets/images/investors/motivate.svg';
import styles from './Investors.module.css';

import useMediaQuery from '../../../utils/hooks/useMediaQuery';
export default function Investors() {
    const row1 = (
        <div className={styles.row1}>
            <img src={blocktower} alt='block tower' />
        </div>
    );

    const row2 = (
        <div className={styles.row2}>
            <img src={jane} alt='jane street' />
            <img src={circle} alt='circle ' />
        </div>
    );

    const row3 = (
        <div className={styles.row3}>
            <img src={tensai} alt='tensai capital' />
            <img src={naval} alt='naval ravikant' />
        </div>
    );

    const row4 = (
        <div className={styles.row4}>
            <img src={yunt} alt='yunt capital' width='200px' />
            <img src={susa} alt='susa ' width='50px' />
            <img src={quantstamp} alt='quantstamp ' width='200px' />
            <img src={hypotenuse} alt='hypotenuse ' width='200px' />
        </div>
    );
    const row5 = (
        <div className={styles.row5}>
            <span>Julian Koh</span>
            <span>llllvvuu</span>
            <span>Dogetoshi</span>
            <span>afkbyte</span>
            <span>Jai Prasad</span>
            <span>Don Ho</span>
        </div>
    );
    const row6 = (
        <div className={styles.row6}>
            <h3>Pre-Seed</h3>
        </div>
    );
    const row7 = (
        <div className={styles.row7}>
            <img src={PositiveSum} alt='positivie sum' />
            <img src={motivate} alt='motivate ' />
        </div>
    );
    const showMobileVersion = useMediaQuery('(max-width: 600px)');

    const preSeedMobile = (
        <div className={styles.pre_seed_mobile}>
            <div className={styles.title_row}>
                <h3>Pre-Seed</h3>
            </div>
            <div className={styles.image_row}>
                <img src={PositiveSum} alt='positive sum' />
                <img src={motivate} alt='motivate' />
            </div>
        </div>
    );

    const mobileVersion = (
        <>
            <div className={styles.mobile_container}>
                <div className={styles.mobile_content}>
                    <img src={blocktower} alt='block tower' width='180px' />
                    <img src={jane} alt='jane street' width='180px' />
                    <img src={circle} alt='circle' width='180px' />
                    <img src={tensai} alt='tensai capital' width='180px' />
                    <img src={naval} alt='naval ravikant' width='180px' />
                    <img src={yunt} alt='yunt capital' width='200px' />
                    <img src={susa} alt='susa' width='50px' />
                    <img src={quantstamp} alt='quantstamp' width='200px' />
                    <img src={hypotenuse} alt='hypotenuse' width='200px' />
                    <span>Julian Koh</span>
                    <span>llllvvuu</span>
                    <span>Dogetoshi</span>
                    <span>afkbyte</span>
                    <span>Jai Prasad</span>
                    <span>Don Sun</span>
                </div>
            </div>
            {preSeedMobile}
        </>
    );
    if (showMobileVersion) return mobileVersion;

    return (
        <section className={styles.container}>
            <h3>Our Investors</h3>
            <div className={styles.content}>
                {row1}
                {row2}
                {row3}
                {row4}
                {row5}
                {row6}
                {row7}
            </div>
        </section>
    );
}
