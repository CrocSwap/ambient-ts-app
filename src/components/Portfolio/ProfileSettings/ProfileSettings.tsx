import React, { Dispatch, SetStateAction } from 'react';
import styles from './ProfileSettings.module.css';
import { BiArrowBack } from 'react-icons/bi';
import ProfileSettingsTheme from './ProfileSettingsTheme/ProfileSettingsTheme';

interface ProfileSettingsPropsIF {
    showProfileSettings: boolean;
    setShowProfileSettings: Dispatch<SetStateAction<boolean>>;
}

export default function ProfileSettings(props: ProfileSettingsPropsIF) {
    const { setShowProfileSettings } = props;
    const nameDisplay = (
        <div className={styles.row}>
            <h4>Name</h4>
            <input type='text' placeholder='Miyuki' />
        </div>
    );
    const profilePicDisplay = (
        <div className={styles.row}>
            <h4>Profile Pic</h4>
            <img
                src='https://lh3.googleusercontent.com/c1Rklfxs7pco3KTRaNfBSo8F4z_offxOSIsmoKxOuRLOurfR5KdtTO3iKFwnb11NvxTVQix_-AV4OsTvWrmR9bP6prDadQpVHQFXNYo'
                alt=' profile pic'
            />
        </div>
    );
    const nftsDisplay = (
        <div className={styles.row}>
            <h4>NFTs</h4>
            <div className={styles.nft_container}>
                <img
                    src='https://images.bitclout.com/1b4dce32a0d4b7a2cfe0ff651aa8c86b7f1a8f0b862793503475289c308d98a0.webp'
                    alt=' profile pic'
                />
                <img
                    src='https://mintspace-media.fra1.digitaloceanspaces.com/wp-content/uploads/2021/11/26174630/pixil-frame-0-1-17-300x300.png'
                    alt=''
                />
                <img
                    src='https://mintspace-media.fra1.digitaloceanspaces.com/wp-content/uploads/2022/01/27231425/iuh.png'
                    alt=''
                />
            </div>
        </div>
    );
    const themeDisplay = (
        <div className={styles.row}>
            <h4>Theme</h4>
            <ProfileSettingsTheme />
        </div>
    );

    return (
        <div className={styles.container}>
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
                    </section>
                </div>
            </div>
        </div>
    );
}
