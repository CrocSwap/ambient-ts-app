import styles from './FollowDisplay.module.css';
import { FiPlus, FiCopy } from 'react-icons/fi';
import { IoMdCheckmark } from 'react-icons/io';
import { AnimateSharedLayout, motion } from 'framer-motion';

import { useState } from 'react';
const iconVariants = {
    open: {
        width: '40px',
        height: '40px',
        borderRadius: '12px',
    },
    closed: {
        width: '12px',
        height: '12px',
        borderRadius: '4px',
    },
};

interface FollowDisplayPropsIF {
    exampleFollowers: {
        _id: string;
        isFollowing: boolean;
        balance: string;
        picture: string;
        name: string;
        email: string;
    }[];
    exampleFollowing: {
        _id: string;
        isFollowing: boolean;
        balance: string;
        picture: string;
        name: string;
        email: string;
    }[];

    showAccountDetails: boolean;
    connectedAccountActive: boolean;
}

interface FollowCardPropsIF {
    avatar: string;
    hash: string;
    ensName: string;
    isFollowing: boolean;
    showAccountDetails: boolean;
    connectedAccountActive: boolean;
}
function FollowCard(props: FollowCardPropsIF) {
    const { avatar, hash, ensName, isFollowing, showAccountDetails, connectedAccountActive } =
        props;

    const buttonStyle = isFollowing ? styles.button_following : styles.button_not_following;
    const buttonIcon = isFollowing ? (
        <IoMdCheckmark size={15} color='#0e131a' />
    ) : (
        <FiPlus size={15} />
    );

    const isUserFollowing = connectedAccountActive ? true : isFollowing ? true : false;
    return (
        <div className={styles.follow_card_container}>
            <motion.img
                animate={showAccountDetails ? 'open' : 'closed'}
                variants={iconVariants}
                src={avatar}
                alt='avatar'
            />
            {showAccountDetails && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={styles.name_display}
                >
                    <h3>
                        {ensName} <span> {isUserFollowing && 'follows you'}</span>
                    </h3>
                    <p>
                        {hash} <FiCopy />
                    </p>
                </motion.div>
            )}
            <div className={styles.button_container}>
                <motion.button
                    animate={{ opacity: showAccountDetails ? [0, 1] : 1 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    className={buttonStyle}
                >
                    {buttonIcon}
                    {isFollowing ? 'Following' : 'Follow'}
                </motion.button>
            </div>
        </div>
    );
}
export default function FollowDisplay(props: FollowDisplayPropsIF) {
    const { exampleFollowers, exampleFollowing, showAccountDetails, connectedAccountActive } =
        props;

    const followersDisplay = (
        <div className={styles.followers_display_container}>
            {exampleFollowers.map((follower, idx) => (
                <FollowCard
                    avatar={follower.picture}
                    ensName={follower.name.split(' ')[0] + '.eth'}
                    key={idx}
                    isFollowing={follower.isFollowing}
                    hash={follower._id}
                    showAccountDetails={showAccountDetails}
                    connectedAccountActive={connectedAccountActive}
                />
            ))}
        </div>
    );
    const followingDisplay = (
        <div className={styles.followers_display_container}>
            {exampleFollowing.map((follower, idx) => (
                <FollowCard
                    avatar={follower.picture}
                    ensName={follower.name.split(' ')[0] + '.eth'}
                    key={idx}
                    isFollowing={follower.isFollowing}
                    hash={follower._id.slice(0, 6) + '...'}
                    showAccountDetails={showAccountDetails}
                    connectedAccountActive={connectedAccountActive}
                />
            ))}
        </div>
    );
    const displayTabs = [
        { label: 'Followers', data: followersDisplay },
        { label: 'Following', data: followingDisplay },
    ];
    const [selectedTab, setSelectedTab] = useState(displayTabs[0]);

    return (
        <div className={styles.main_container}>
            <header className={styles.tab_header}>
                <ul>
                    {displayTabs.map((tab, idx) => (
                        <li
                            key={idx}
                            className={tab.label === selectedTab.label ? styles.header_active : ''}
                            onClick={() => setSelectedTab(tab)}
                        >
                            {tab.label}
                            {tab.label === selectedTab.label ? (
                                <motion.div className={styles.underline} layoutId='underline' />
                            ) : null}
                        </li>
                    ))}
                </ul>
            </header>
            <AnimateSharedLayout>
                <motion.div
                    key={selectedTab ? selectedTab.label : 'empty'}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {selectedTab ? selectedTab.data : null}
                </motion.div>
            </AnimateSharedLayout>
        </div>
    );
}
