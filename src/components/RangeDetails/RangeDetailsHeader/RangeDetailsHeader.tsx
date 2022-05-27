import styles from './RangeDetailsHeader.module.css';
import ambientLogo from '../../../assets/images/logos/ambient_logo.svg';

export default function RangeDetailsHeader() {
    return (
        <div className={styles.container}>
            <img src={ambientLogo} alt='ambient' width='35px' />
            <span className={styles.ambient_title}>ambient</span>
        </div>
    );
}
