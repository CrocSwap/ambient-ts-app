import styles from './PortfolioBanner.module.css';
import nft1 from '../../../assets/images/Temporary/nft/nft1.png';
import nft2 from '../../../assets/images/Temporary/nft/nft2.png';
import nft3 from '../../../assets/images/Temporary/nft/nft3.png';
import avatarImage from '../../../assets/images/Temporary/nft/avatar.png';

export default function PortfolioBanner() {
    return (
        <div className={styles.rectangle_container}>
            <div className={styles.account_container}>
                <img src={avatarImage} alt='avatar' />
                <div className={styles.account_names}>
                    <span className={styles.name}>Username.eth</span>
                    <span className={styles.hash}>0x284c...Ec38</span>
                </div>
            </div>

            <div className={styles.nft_container}>
                <img src={nft1} alt='nft' />
                <img src={nft2} alt='nft' />
                <img src={nft3} alt='nft' />
            </div>
        </div>
    );
}
