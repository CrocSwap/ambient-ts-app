import noAvatarImage from '../../../../assets/images/icons/avatar.svg';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import SnackbarComponent from '../../../../components/Global/SnackbarComponent/SnackbarComponent';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface IPortfolioBannerAccountPropsIF {
    imageData: string[];
    ensName: string;
    resolvedAddress: string;
    activeAccount: string;
    truncatedAccountAddress: string;
    ensNameAvailable: boolean;
    connectedAccountActive: boolean;
}
import styles from './PortfolioBannerAccount.module.css';

// const variants = {
//     open: {
//         width: '500px',
//         height: 'auto',
//         borderRadius: '20px',
//         background: 'var(--dark3)',
//         boxShadow: '0px 45px 20px rgba(0, 0, 0, 0.9)',

//     },
//     closed: {
//         width: 'auto',
//         height: '56px',
//         borderRadius: '99px',
//         background: '',

//     },
// };
export default function PortfolioBannerAccount(props: IPortfolioBannerAccountPropsIF) {
    const [showAccountDetails, setShowAccountDetails] = useState(false);

    const {
        imageData,
        ensName,
        resolvedAddress,
        activeAccount,
        truncatedAccountAddress,
        ensNameAvailable,
        // connectedAccountActive,
    } = props;

    const ensNameToDisplay = ensNameAvailable
        ? ensName
        : resolvedAddress
        ? activeAccount
        : truncatedAccountAddress;

    const addressToDisplay = resolvedAddress
        ? resolvedAddress
        : ensNameAvailable
        ? truncatedAccountAddress
        : activeAccount;
    const [openSnackbar, setOpenSnackbar] = useState(false);
    // eslint-disable-next-line
    const [value, copy] = useCopyToClipboard();
    const [copiedData, setCopiedData] = useState('');

    function handleCopyEnsName() {
        copy(ensNameToDisplay);
        setCopiedData(ensNameToDisplay);

        setOpenSnackbar(true);
    }
    function handleCopyAddress() {
        copy(activeAccount);
        setCopiedData(activeAccount);

        setOpenSnackbar(true);
    }

    const snackbarContent = (
        <SnackbarComponent
            severity='info'
            setOpenSnackbar={setOpenSnackbar}
            openSnackbar={openSnackbar}
        >
            {copiedData} copied
        </SnackbarComponent>
    );

    const iconVariants = {
        open: {
            width: '56px',
            height: '56px',
            // borderRadius: '12px',
        },
        closed: {
            width: '56px',
            height: '56px',
            // borderRadius: '50%',
        },
    };

    return (
        <motion.main
            // style={{padding: showAccountDetails ? '24px' : '8px 16px'}}
            className={styles.main_container}
            animate={showAccountDetails ? 'open' : 'closed'}
            // variants={variants}

            // style={{ background: showAccountDetails ? 'black' : '' }}
        >
            <div
                className={styles.account_container}
                onClick={() => setShowAccountDetails(!showAccountDetails)}
            >
                <motion.div
                    className={styles.avatar_image}
                    animate={showAccountDetails ? 'open' : 'closed'}
                    variants={iconVariants}
                >
                    {imageData[0] ? (
                        <img src={imageData[0]} alt='avatar' />
                    ) : (
                        <img src={noAvatarImage} alt='no avatar' />
                    )}
                </motion.div>
                <div className={styles.account_names}>
                    <span className={styles.name} onClick={handleCopyEnsName}>
                        {ensNameToDisplay}
                    </span>
                    <span className={styles.hash} onClick={handleCopyAddress}>
                        {addressToDisplay}
                    </span>
                </div>
            </div>
            {/* {showAccountDetails && (
                <FollowDisplay
                    exampleFollowers={exampleFollowers}
                    exampleFollowing={exampleFollowing}
                    showAccountDetails={showAccountDetails}
                    connectedAccountActive={connectedAccountActive}
                />
            )} */}
            {snackbarContent}
        </motion.main>
    );
}
