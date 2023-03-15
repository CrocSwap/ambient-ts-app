import styles from './PortfolioBanner.module.css';
import trimString from '../../../utils/functions/trimString';
import Blockies from 'react-blockies';

// import { AiOutlineSetting } from 'react-icons/ai';
// import { FiPlus } from 'react-icons/fi';
// import { IoMdCheckmark } from 'react-icons/io';
import { Dispatch, SetStateAction } from 'react';
// import SnackbarComponent from '../../../components/Global/SnackbarComponent/SnackbarComponent';
// import { motion } from 'framer-motion';
import PortfolioBannerAccount from './PortfolioBannerAccount/PortfolioBannerAccount';
interface PortfolioBannerPropsIF {
    ensName: string;
    activeAccount: string;
    imageData: string[];
    resolvedAddress: string;
    setShowProfileSettings: Dispatch<SetStateAction<boolean>>;
    connectedAccountActive: boolean;
}

export default function PortfolioBanner(props: PortfolioBannerPropsIF) {
    const {
        ensName,
        activeAccount,
        imageData,
        resolvedAddress,
        // setShowProfileSettings,
        connectedAccountActive,
    } = props;
    const ensNameAvailable = ensName !== '';

    const myBlockies = (
        <Blockies seed={resolvedAddress || activeAccount} scale={7.4} bgColor={'#171D27'} />
    );

    const truncatedAccountAddress = connectedAccountActive
        ? trimString(activeAccount, 6, 6, '…')
        : trimString(resolvedAddress, 6, 6, '…');

    // const [isFollowing, setIsFollowing] = useState(false);
    // const [openSnackbar, setOpenSnackbar] = useState(false);

    // const buttonStyle = isFollowing ? styles.button_following : styles.button_not_following;
    // const buttonIcon = isFollowing ? (
    //     <IoMdCheckmark size={15} color='#0e131a' />
    // ) : (
    //     <FiPlus size={15} />
    // );

    // function handleFollowingClick() {
    //     setIsFollowing(!isFollowing);
    //     setOpenSnackbar(true);
    // }
    // const snackbarContent = (
    //     <SnackbarComponent
    //         severity='info'
    //         setOpenSnackbar={setOpenSnackbar}
    //         openSnackbar={openSnackbar}
    //     >
    //         {isFollowing ? 'Following' : 'Unfollowed'}{' '}
    //         {ensNameAvailable ? ensName : resolvedAddress ? activeAccount : truncatedAccountAddress}
    //     </SnackbarComponent>
    // );

    const blockiesToDisplay =
        (resolvedAddress || connectedAccountActive) && myBlockies ? myBlockies : null;

    return (
        <div className={styles.rectangle_container}>
            {connectedAccountActive && (
                <div className={styles.settings_container}>
                    {/* <motion.button
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    className={buttonStyle}
                    onClick={handleFollowingClick}
                >
                    {buttonIcon}
                    Follow
                </motion.button> */}
                    {/* <div style={{ cursor: 'pointer' }} onClick={() => setShowProfileSettings(true)}>
                        <AiOutlineSetting size={20} color='#bdbdbd' />{' '}
                    </div> */}
                </div>
            )}
            <PortfolioBannerAccount
                imageData={imageData}
                ensName={ensName}
                ensNameAvailable={ensNameAvailable}
                resolvedAddress={resolvedAddress}
                activeAccount={activeAccount}
                truncatedAccountAddress={truncatedAccountAddress}
                connectedAccountActive={connectedAccountActive}
                blockiesToDisplay={blockiesToDisplay}
            />
            <div className={styles.nft_container}>
                {/* {imageData[0] ? <img src={imageData[0]} alt='nft' /> : null} */}
                {imageData[1] ? <img src={imageData[1]} alt='nft' /> : null}
                {imageData[2] ? <img src={imageData[2]} alt='nft' /> : null}
                {imageData[3] ? <img src={imageData[3]} alt='nft' /> : null}
                {blockiesToDisplay}
            </div>
            {/* {snackbarContent} */}
        </div>
    );
}
