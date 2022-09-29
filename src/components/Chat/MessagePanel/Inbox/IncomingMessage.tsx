import styles from './IncomingMessage.module.css';
import noAvatarImage from '../../../../assets/images/icons/avatar.svg';
import { Message } from '../../Model/MessageModel';
import { useMoralis } from 'react-moralis';
import { useEffect, useState } from 'react';

export interface IncomingMessageProps {
    message: Message;
}
export default function IncomingMessage(props: IncomingMessageProps) {
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
        if (data.status === 'OK') {
            setName(data.ensName);
        }
    }

    useEffect(() => {
        getName();
    }),
        [name];

    return (
        <div className={styles.income_message}>
            <div className={styles.avatar_image}>
                <img src={noAvatarImage} alt='no avatar' />
            </div>
            <div className={styles.message_body}>
                <div className={styles.name}>{name}</div>
                <p className={styles.message}>{props.message.message}</p>
            </div>
            <p className={styles.message_date}>{formatAMPM(props.message.createdAt)}</p>
        </div>
    );
}
