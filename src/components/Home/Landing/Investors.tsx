import blocktower from '../../../assets/images/investors/blocktower.svg';
import jane from '../../../assets/images/investors/jane.svg';
import circle from '../../../assets/images/investors/circle.svg';
import tensai from '../../../assets/images/investors/tensai.svg';
import naval from '../../../assets/images/investors/naval.svg';
import yunt from '../../../assets/images/investors/yunt.svg';
import susa from '../../../assets/images/investors/susa.svg';
import quantstamp from '../../../assets/images/investors/quantstamp.svg';
import hypotenuse from '../../../assets/images/investors/hypotenuse.svg';
import julian from '../../../assets/images/investors/julian.svg';
import L from '../../../assets/images/investors/L.svg';
import dogetoshii from '../../../assets/images/investors/dogetoshii.svg';
import afk from '../../../assets/images/investors/afk.svg';
import jai from '../../../assets/images/investors/jai.svg';
import Don from '../../../assets/images/investors/Don.svg';
import PreSeed from '../../../assets/images/investors/Pre-Seed.svg';
import PositiveSum from '../../../assets/images/investors/positivesum.svg';
import motivate from '../../../assets/images/investors/motivate.svg';
import styles from './Investors.module.css';
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
            <img src={yunt} alt='yunt capital' />
            <img src={susa} alt='susa ' />
            <img src={quantstamp} alt='quantstamp ' />
            <img src={hypotenuse} alt='hypotenuse ' />
        </div>
    );
    const row5 = (
        <div className={styles.row5}>
            <img src={julian} alt='julian Koh' />
            <img src={L} alt='Lllvvuu ' />
            <img src={dogetoshii} alt='dogetoshii ' />
            <img src={afk} alt='afkbyte ' />
            <img src={jai} alt='jai prasad ' />
            <img src={Don} alt='don sun ' />
        </div>
    );
    const row6 = (
        <div className={styles.row6}>
            <img src={PreSeed} alt='pre-seed' />
        </div>
    );
    const row7 = (
        <div className={styles.row7}>
            <img src={PositiveSum} alt='positivie sum' />
            <img src={motivate} alt='motivate ' />
        </div>
    );

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
