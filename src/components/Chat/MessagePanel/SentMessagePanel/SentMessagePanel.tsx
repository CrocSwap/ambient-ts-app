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
    const [isPosition, setIsPosition] = useState(false);
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

    return (
        <div className={styles.sent_message_body}>
            <p className={styles.message_date}>{formatAMPM(props.message.createdAt)}</p>
            <div className={styles.message_item}>
                {!isPosition && <p className={styles.message}>{props.message.message}</p>}
                <PositionBox
                    message={props.message.message}
                    isInput={false}
                    isPosition={isPosition}
                    setIsPosition={setIsPosition}
                />
            </div>
            <div className={styles.avatar_image}>
                <img src={noAvatarImage} alt='no avatar' />
            </div>
        </div>
    );
}
