import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from 'react';
import styles from './ProfileSettings.module.css';
import { BiArrowBack } from 'react-icons/bi';
import ProfileSettingsTheme from './ProfileSettingsTheme/ProfileSettingsTheme';
import ProfileSettingsSkin from './ProfileSettingsSkin/ProfileSettingsSkin';

import useChatApi from '../../Chat/Service/ChatApi';
import { CHAT_BACKEND_URL, IS_LOCAL_ENV } from '../../../constants';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { ProfileSettingsMotionContainer } from './ProfileSettings.styles';
import { FlexContainer, Text } from '../../../styled/Common';

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
    setShowProfileSettings: Dispatch<SetStateAction<boolean>>;
}

export default function ProfileSettings(props: ProfileSettingsPropsIF) {
    const [name, setName] = useState('');
    const [id, setId] = useState('');
    const { setShowProfileSettings } = props;
    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);
    const host = CHAT_BACKEND_URL;
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

    const profilePicDisplay = (
        <div className={styles.row}>
            <h4>Profile Pic</h4>
            {/* {imageData[0] ? (
                <img src={imageData[0]} alt='avatar' />
            ) : (
                <div className={styles.no_image}>
                    <img src={noAvatarImage} alt='' />
                </div>
            )} */}
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

    const { getID } = useChatApi();

    useEffect(() => {
        getID().then((result) => {
            setId(result._id);
            setName(result.ensName);
        });
    }, []);

    async function updateUser() {
        const response = await fetch(host + '/chat/api/auth/updateUser', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ensName: name, _id: id }),
        });

        const data = await response.json();
        if (data.status === 'OK') {
            IS_LOCAL_ENV && console.debug('aaaa', data);
            openSnackbar(`${name} has been set as a name.`, 'info');
        } else {
            IS_LOCAL_ENV && console.debug('bbb', data.status);
        }
    }

    return (
        <ProfileSettingsMotionContainer
            initial='initial'
            animate='in'
            exit='out'
            variants={pageVariant3D}
            transition={pageTransition}
        >
            <div
                style={{ cursor: 'pointer' }}
                onClick={() => setShowProfileSettings(false)}
            >
                <BiArrowBack size={30} />
            </div>
            <FlexContainer justifyContent='center'>
                <FlexContainer flexDirection='column' width='306px'>
                    <Text fontWeight='300' fontSize='header1' color='text1'>
                        Profile Settings
                    </Text>
                    <section>
                        {nameDisplay}
                        {profilePicDisplay}
                        {themeDisplay}
                        {skinDisplay}
                    </section>
                    <button
                        className={styles.save_button}
                        onClick={() => updateUser()}
                    >
                        Save
                    </button>
                </FlexContainer>
            </FlexContainer>
        </ProfileSettingsMotionContainer>
    );
}
