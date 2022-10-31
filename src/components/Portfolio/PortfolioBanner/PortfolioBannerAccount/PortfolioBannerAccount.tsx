import noAvatarImage from '../../../../assets/images/icons/avatar.svg';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { exampleFollowers, exampleFollowing } from './exampleAccounts';
import { IoMdArrowDropdown } from 'react-icons/io';
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
import FollowDisplay from './FollowDisplay/FollowDisplay';

export default function PortfolioBannerAccount(props: IPortfolioBannerAccountPropsIF) {
    const [showAccountDetails, setShowAccountDetails] = useState(false);

    const variants = {
        open: {
            width: '500px',
            height: 'auto',
            borderRadius: '20px',
            background: '#12171f',
            boxShadow: '0px 45px 20px rgba(0, 0, 0, 0.9)',
            // padding: '24px'
        },
        closed: {
            width: 'auto',
            height: '56px',
            borderRadius: '99px',
            background: '',
            // padding: '8px 16px'
        },
    };

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
    const {
        imageData,
        ensName,
        resolvedAddress,
        activeAccount,
        truncatedAccountAddress,
        ensNameAvailable,
        connectedAccountActive,
    } = props;

    return (
        <motion.main
            // style={{padding: showAccountDetails ? '24px' : '8px 16px'}}
            className={styles.main_container}
            animate={showAccountDetails ? 'open' : 'closed'}
            variants={variants}

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
                    <span className={styles.name}>
                        {ensNameAvailable
                            ? ensName
                            : resolvedAddress
                            ? activeAccount
                            : truncatedAccountAddress}
                        <IoMdArrowDropdown />
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
            {showAccountDetails && (
                <FollowDisplay
                    exampleFollowers={exampleFollowers}
                    exampleFollowing={exampleFollowing}
                    showAccountDetails={showAccountDetails}
                    connectedAccountActive={connectedAccountActive}
                />
            )}
        </motion.main>
    );
}
