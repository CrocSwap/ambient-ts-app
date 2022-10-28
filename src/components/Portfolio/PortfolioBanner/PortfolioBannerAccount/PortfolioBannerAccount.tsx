import noAvatarImage from '../../../../assets/images/icons/avatar.svg';
import { useState } from 'react';
import { motion } from 'framer-motion';
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
    const [showAccountDetails, setShowAccountDetails] = useState(false);

    const variants = {
        open: {
            width: '500px',
            height: 'auto',
            borderRadius: '20px',
            background: 'black',
        },
        closed: {
            width: '280px',
            height: '56px',
            borderRadius: '99px',
        },
    };

    const iconVariants = {
        open: {
            width: '48px',
            height: '48px',
            borderRadius: '12px',
        },
        closed: {
            width: '48px',
            height: '48px',
            borderRadius: '50%',
        },
    };
    const {
        imageData,
        ensName,
        resolvedAddress,
        activeAccount,
        truncatedAccountAddress,
        ensNameAvailable,
    } = props;

    const accountDetails = (
        <div>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Consectetur illo quibusdam
            voluptate quod corporis. Facere ipsa quos rerum nihil a perspiciatis minima delectus
            quaerat sed voluptatem labore deserunt, atque veniam exercitationem iure, quidem ex
            dolore animi suscipit consectetur fuga illum tempora facilis corporis! Nobis eaque
            sapiente ducimus facere praesentium dolor!
        </div>
    );
    return (
        <motion.main
            className={styles.main_container}
            animate={showAccountDetails ? 'open' : 'closed'}
            variants={variants}
            onClick={() => setShowAccountDetails(!showAccountDetails)}
            // style={{ background: showAccountDetails ? 'black' : '' }}
        >
            <div className={styles.account_container}>
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
            {showAccountDetails && accountDetails}
        </motion.main>
    );
}
