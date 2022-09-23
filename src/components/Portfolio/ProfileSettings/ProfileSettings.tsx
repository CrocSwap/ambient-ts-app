import React, { Dispatch, SetStateAction } from 'react';
import styles from './ProfileSettings.module.css';
import { BiArrowBack } from 'react-icons/bi';
import ProfileSettingsTheme from './ProfileSettingsTheme/ProfileSettingsTheme';
import ProfileSettingsSkin from './ProfileSettingsSkin/ProfileSettingsSkin';
import noAvatarImage from '../../../assets/images/icons/avatar.svg';

import { motion } from 'framer-motion';

const pageVariant3D = {
    initial: {
        opacity: 0,
        x: '-100vw',
        scale: 0.8,
    },
    in: {
        opacity: 1,
        x: 0,
        scale: 1,
    },
    out: {
        opacity: 0,
        x: '-100vw',
        scale: 1.2,
    },
};

const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 1,
};
interface ProfileSettingsPropsIF {
    showProfileSettings: boolean;
    setShowProfileSettings: Dispatch<SetStateAction<boolean>>;
    ensName: string;
    imageData: string[];
    openGlobalModal: (content: React.ReactNode, title?: string) => void;
}

export default function ProfileSettings(props: ProfileSettingsPropsIF) {
    const { setShowProfileSettings, ensName, imageData, openGlobalModal } = props;
    const nameDisplay = (
        <div className={styles.row}>
            <h4>Name</h4>
            <input type='text' placeholder={ensName} />
        </div>
    );

    const nftModalContent = (
        <div className={styles.nft_modal_container}>
            {imageData.length ? (
                imageData.map((img) => <img key={img} src={img} alt='' />)
            ) : (
                <h1>No nfts to display</h1>
            )}
        </div>
    );

    const profilePicDisplay = (
        <div className={styles.row}>
            <h4>Profile Pic</h4>
            {imageData[0] ? (
                <img src={imageData[0]} alt='avatar' />
            ) : (
                <div className={styles.no_image}>
                    <img src={noAvatarImage} alt='' />
                </div>
            )}
        </div>
    );

    const nfts = (
        <>
            {imageData.map((img) => (
                <img
                    onClick={() => openGlobalModal(nftModalContent, 'NFTs')}
                    key={img}
                    src={img}
                    alt=''
                />
            ))}
        </>
    );
    const nftsPlaceholder = (
        <>
            {Array(3)
                .fill(null)
                .map((i) => (
                    <div
                        className={styles.no_image}
                        onClick={() => openGlobalModal(nftModalContent, 'NFTs')}
                        key={i}
                    />
                ))}
        </>
    );
    const nftsDisplay = (
        <div className={styles.row}>
            <h4>NFTs</h4>
            <div className={styles.nft_container}>{imageData.length ? nfts : nftsPlaceholder}</div>
        </div>
    );
    const themeDisplay = (
        <div className={styles.row}>
            <h4>Theme</h4>
            <ProfileSettingsTheme />
        </div>
    );
    const skinDisplay = (
        <div className={styles.row}>
            <h4>Skin</h4>
            <ProfileSettingsSkin />
        </div>
    );

    return (
        <motion.div
            initial='initial'
            animate='in'
            exit='out'
            variants={pageVariant3D}
            transition={pageTransition}
            className={styles.container}
        >
            <div className={styles.back_button} onClick={() => setShowProfileSettings(false)}>
                <BiArrowBack size={30} />
            </div>
            <div className={styles.content}>
                <div className={styles.settings_container}>
                    <h3>Profile Settings</h3>
                    <section>
                        {nameDisplay}
                        {profilePicDisplay}
                        {nftsDisplay}
                        {themeDisplay}
                        {skinDisplay}
                    </section>
                    <button className={styles.save_button}>Save</button>
                </div>
            </div>
        </motion.div>
    );
}
