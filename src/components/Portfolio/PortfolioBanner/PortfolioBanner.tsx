import styles from './PortfolioBanner.module.css';
import trimString from '../../../utils/functions/trimString';

interface PortfolioBannerPropsIF {
    ensName: string;
    connectedAccount: string;
    imageData: string[];
}

export default function PortfolioBanner(props: PortfolioBannerPropsIF) {
    const { ensName, connectedAccount, imageData } = props;
    const ensNameAvailable = ensName !== '';

    const truncatedAccountAddress = trimString(connectedAccount, 6, 6, '…');

    return (
        <div className={styles.rectangle_container}>
            <div className={styles.account_container}>
                {imageData[0] ? <img src={imageData[0]} alt='avatar' /> : null}
                <div className={styles.account_names}>
                    <span className={styles.name}>
                        {ensNameAvailable ? ensName : truncatedAccountAddress}
                    </span>
                    <span className={styles.hash}>
                        {ensNameAvailable ? truncatedAccountAddress : connectedAccount}
                    </span>
                </div>
            </div>
            <div className={styles.nft_container}>
                {imageData[1] ? <img src={imageData[1]} alt='nft' /> : null}
                {imageData[2] ? <img src={imageData[2]} alt='nft' /> : null}
                {imageData[3] ? <img src={imageData[3]} alt='nft' /> : null}
            </div>
        </div>
    );
}
