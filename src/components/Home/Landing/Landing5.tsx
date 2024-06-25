import styles from './LandingStyles.module.css';
import blockTower from '../../../assets/images/investors/blocktower.svg';
import janeStreet from '../../../assets/images/investors/janeStreet.svg';
import circle from '../../../assets/images/investors/circle.svg';
import tensai from '../../../assets/images/investors/tensai.svg';
import naval from '../../../assets/images/investors/naval.svg';
import susa from '../../../assets/images/investors/susa.svg';
import quantStamp from '../../../assets/images/investors/quantstamp.svg';
import hypotenuse from '../../../assets/images/investors/hypotenuse.svg';
import julianKoh from '../../../assets/images/investors/julianKoh.svg';
import donSun from '../../../assets/images/investors/donSun.svg';
import lllvvuu from '../../../assets/images/investors/lllvvuu.svg';
import dogetoshi from '../../../assets/images/investors/dogetoshi.svg';
import positiveSum from '../../../assets/images/investors/positivesum.svg';
import motivate from '../../../assets/images/investors/motivate.svg';
import yunt from '../../../assets/images/investors/yunt.svg';
import afkbyte from '../../../assets/images/investors/afkbyte.svg';
import jaiPrasad from '../../../assets/images/investors/jaiPrasad.svg';

export default function Landing5() {
    const investorsData = [
        { label: 'Blocktower', logo: blockTower },
        { label: 'Jane Street', logo: janeStreet },
        { label: 'Circle', logo: circle },
        { label: 'Tensai Capital', logo: tensai },
        { label: 'Naval Ravikant', logo: naval },
        { label: 'Yunt Capital', logo: yunt },
        { label: 'Susa Ventures', logo: susa },
        { label: 'Quantstamp', logo: quantStamp },
        { label: 'Hypotenuse Labs', logo: hypotenuse },
        { label: 'Julian Koh', logo: julianKoh },
        { label: 'Don Sun', logo: donSun },
        { label: 'lllvvuu', logo: lllvvuu },
        { label: 'Dogetoshi', logo: dogetoshi },
        { label: 'afkbyte', logo: afkbyte },
        { label: 'Jai Prasad', logo: jaiPrasad },
        { label: 'Positive Sum', logo: positiveSum },
        { label: 'Motivate Venture Capital', logo: motivate },
    ];

    return (
        <div className={`${styles.sub_container} ${styles.smaller_gap}`}>
            <h2>Backed by the best</h2>
            <div className={styles.investors_container}>
                {investorsData.map((data, idx) => (
                    <img
                        src={data.logo}
                        alt={`Logo for ${data.label}`}
                        key={data.label + idx}
                    />
                ))}
            </div>
        </div>
    );
}
