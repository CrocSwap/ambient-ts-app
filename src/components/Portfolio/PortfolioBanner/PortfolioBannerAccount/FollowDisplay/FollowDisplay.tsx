import styles from './FollowDisplay.module.css';
import { FiPlus } from 'react-icons/fi';
import { IoMdCheckmark } from 'react-icons/io';
import { motion } from 'framer-motion';
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
}

interface FollowCardPropsIF {
    avatar: string;
    hash: string;
    ensName: string;
    isFollowing: boolean;
}
function FollowCard(props: FollowCardPropsIF) {
    const { avatar, hash, ensName, isFollowing } = props;

    const buttonStyle = isFollowing ? styles.button_following : styles.button_not_following;
    const buttonIcon = isFollowing ? (
        <IoMdCheckmark size={15} color='#0e131a' />
    ) : (
        <FiPlus size={15} />
    );
    return (
        <div className={styles.follow_card_container}>
            <img src={avatar} alt='avatar' width='30px' />
            <div className={styles.name_display}>
                <h3>{ensName}</h3>
                <p>{hash}</p>
            </div>
            <div className={styles.button_container}>
                <motion.button
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
    const { exampleFollowers, exampleFollowing } = props;

    const followersDisplay = (
        <div className={styles.followers_display_container}>
            {exampleFollowers.map((follower, idx) => (
                <FollowCard
                    avatar={follower.picture}
                    ensName={follower.name}
                    key={idx}
                    isFollowing={follower.isFollowing}
                    hash={follower._id}
                />
            ))}
        </div>
    );
    return <div className={styles.main_container}>{followersDisplay}</div>;
}
