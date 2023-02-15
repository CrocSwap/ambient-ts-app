import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import styles from './ProfileSettings.module.css';
import { BiArrowBack } from 'react-icons/bi';
import ProfileSettingsTheme from './ProfileSettingsTheme/ProfileSettingsTheme';
import ProfileSettingsSkin from './ProfileSettingsSkin/ProfileSettingsSkin';
import noAvatarImage from '../../../assets/images/icons/avatar.svg';

import { motion } from 'framer-motion';
import useChatApi from '../../Chat/Service/ChatApi';
import SnackbarComponent from '../../Global/SnackbarComponent/SnackbarComponent';

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
    const [name, setName] = useState('');
    const [id, setId] = useState('');
    const { setShowProfileSettings, imageData, openGlobalModal } = props;
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const host = 'https://ambichat.link:5000';
    const nameDisplay = (
        <div className={styles.row}>
            <h4>Name</h4>
            <input
                type='text'
                onChange={(e) => setName(e.target.value)}
                value={name}
                placeholder={name ? name : 'Name'}
            />
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

    const snackbarContent = (
        <SnackbarComponent
            severity='info'
            setOpenSnackbar={setOpenSnackbar}
            openSnackbar={openSnackbar}
        >
            {name} has been set as a name.
        </SnackbarComponent>
    );

    const { getID } = useChatApi();

    useEffect(() => {
        getID().then((result) => {
            setId(result._id);
            setName(result.ensName);
        });
    }, []);

    async function updateUser() {
        const response = await fetch(host + '/api/auth/updateUser', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ensName: name, _id: id }),
        });

        const data = await response.json();
        if (data.status === 'OK') {
            console.log('aaaa', data);
            setOpenSnackbar(true);
        } else {
            console.log('bbb', data.status);
        }
    }

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
                    <button className={styles.save_button} onClick={() => updateUser()}>
                        Save
                    </button>
                    {snackbarContent}
                </div>
            </div>
        </motion.div>
    );
}
