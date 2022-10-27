import styles from './PortfolioBanner.module.css';
import trimString from '../../../utils/functions/trimString';
import noAvatarImage from '../../../assets/images/icons/avatar.svg';
import { AiOutlineSetting } from 'react-icons/ai';
import { FiPlus } from 'react-icons/fi';
import { IoMdCheckmark } from 'react-icons/io';
import { Dispatch, SetStateAction, useState } from 'react';
import SnackbarComponent from '../../../components/Global/SnackbarComponent/SnackbarComponent';
import { motion } from 'framer-motion';
interface PortfolioBannerPropsIF {
    ensName: string;
    activeAccount: string;
    imageData: string[];
    resolvedAddress: string;
    setShowProfileSettings: Dispatch<SetStateAction<boolean>>;
}

export default function PortfolioBanner(props: PortfolioBannerPropsIF) {
    const { ensName, activeAccount, imageData, resolvedAddress, setShowProfileSettings } = props;
    const ensNameAvailable = ensName !== '';

    const truncatedAccountAddress = trimString(activeAccount, 6, 6, '…');

    const [isFollowing, setIsFollowing] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const buttonStyle = isFollowing ? styles.button_following : styles.button_not_following;
    const buttonIcon = isFollowing ? (
        <IoMdCheckmark size={15} color='#0e131a' />
    ) : (
        <FiPlus size={15} />
    );

    function handleFollowingClick() {
        setIsFollowing(!isFollowing);
        setOpenSnackbar(true);
    }
    const snackbarContent = (
        <SnackbarComponent
            severity='info'
            setOpenSnackbar={setOpenSnackbar}
            openSnackbar={openSnackbar}
        >
            {isFollowing ? 'Following' : 'Unfollowed'}{' '}
            {ensNameAvailable ? ensName : resolvedAddress ? activeAccount : truncatedAccountAddress}
        </SnackbarComponent>
    );

    return (
        <div className={styles.rectangle_container}>
            <div className={styles.settings_container}>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    className={buttonStyle}
                    onClick={handleFollowingClick}
                >
                    {buttonIcon}
                    Follow
                </motion.button>
                <div style={{ cursor: 'pointer' }} onClick={() => setShowProfileSettings(true)}>
                    <AiOutlineSetting size={20} color='#bdbdbd' />{' '}
                </div>
            </div>
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
            <div className={styles.nft_container}>
                {imageData[1] ? <img src={imageData[1]} alt='nft' /> : null}
                {imageData[2] ? <img src={imageData[2]} alt='nft' /> : null}
                {imageData[3] ? <img src={imageData[3]} alt='nft' /> : null}
            </div>
            {snackbarContent}
        </div>
    );
}
