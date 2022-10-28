import noAvatarImage from '../../../../assets/images/icons/avatar.svg';

interface IPortfolioBannerAccountPropsIF {
    imageData: string[];
    ensName: string;
    resolvedAddress: string;
    activeAccount: string;
    truncatedAccountAddress: string;
    ensNameAvailable: boolean;
}

import styles from './PortfolioBannerAccount.module.css';

export default function PortfolioBannerAccount(props: IPortfolioBannerAccountPropsIF) {
    const {
        imageData,
        ensName,
        resolvedAddress,
        activeAccount,
        truncatedAccountAddress,
        ensNameAvailable,
    } = props;
    return (
        <div className={styles.account_container}>
            <div className={styles.avatar_image}>
                {imageData[0] ? (
                    <img src={imageData[0]} alt='avatar' />
                ) : (
                    <img src={noAvatarImage} alt='no avatar' />
                )}
            </div>
            <div className={styles.account_names}>
                <span className={styles.name}>
                    {ensNameAvailable
                        ? ensName
                        : resolvedAddress
                        ? activeAccount
                        : truncatedAccountAddress}
                    {/* <div onClick={() => setShowProfileSettings(true)}>
                    <FiEdit size={17} />
                </div> */}
                </span>
                <span className={styles.hash}>
                    {resolvedAddress
                        ? resolvedAddress
                        : ensNameAvailable
                        ? truncatedAccountAddress
                        : activeAccount}
                </span>
            </div>
        </div>
    );
}
