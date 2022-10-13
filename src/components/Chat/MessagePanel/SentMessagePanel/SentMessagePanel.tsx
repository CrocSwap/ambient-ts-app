import styles from './SentMessagePanel.module.css';
import noAvatarImage from '../../../../assets/images/icons/avatar.svg';
import { Message } from '../../Model/MessageModel';
import PositionBox from '../PositionBox/PositionBox';
import { useEffect, useState } from 'react';
import { useMoralis } from 'react-moralis';

interface SentMessageProps {
    message: Message;
}

export default function SentMessagePanel(props: SentMessageProps) {
    const { user, account, enableWeb3, isWeb3Enabled, isAuthenticated } = useMoralis();
    const [name, setName] = useState('');
    const formatAMPM = (str: any) => {
        const date = new Date(str);
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const _min = minutes.toString().padStart(2, '0');
        const strTime = hours + ':' + _min + ' ' + ampm;
        return strTime;
    };
    async function getName() {
        const response = await fetch('http://localhost:5000/api/auth/getUserByAccount/' + account, {
            method: 'GET',
        });
        const data = await response.json();

        return data;
    }

    useEffect(() => {
        getName().then((res) => {
            setName(res.userData.ensName);
        });
    }, [name]);

    return (
        <div className={styles.sent_message_body}>
            <PositionBox message={props.message.message} />
            <div className={styles.message_item}>
                <p className={styles.message_date}>{formatAMPM(props.message.createdAt)}</p>
                <p className={styles.message}>{props.message.message}</p>
                <div className={styles.avatar_image}>
                    <div className={styles.name}>{name}</div>
                    <img src={noAvatarImage} alt='no avatar' />
                </div>
            </div>
        </div>
    );
}
