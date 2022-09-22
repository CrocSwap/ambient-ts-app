import React, { Dispatch, SetStateAction } from 'react';
import styles from './ProfileSettings.module.css';

interface ProfileSettingsPropsIF {
    showProfileSettings: boolean;
    setShowProfileSettings: Dispatch<SetStateAction<boolean>>;
}

export default function ProfileSettings(props: ProfileSettingsPropsIF) {
    return <div className={styles.container}>PROFILE SETTINGS</div>;
}
