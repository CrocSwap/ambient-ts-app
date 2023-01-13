import styles from './SentMessagePanel.module.css';
import noAvatarImage from '../../../../assets/images/icons/avatar.svg';
import { Message } from '../../Model/MessageModel';
import PositionBox from '../PositionBox/PositionBox';
import { useEffect, useState } from 'react';
import useChatApi from '../../../../components/Chat/Service/ChatApi';
import { color } from 'd3';

interface SentMessageProps {
    message: Message;
}

export default function SentMessagePanel(props: SentMessageProps) {
    const [isPosition, setIsPosition] = useState(false);
    const { receiveUsername, getNameOrWallet } = useChatApi();
    const [mentionedName, setMentionedName] = useState('');
    const [isMentionMessage, setIsMentionMessage] = useState(false);
    const message = '';

    const formatAMPM = (str: string) => {
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

    function mentionedMessage() {
        const messagesArray = props.message.message.split(' ');
        if (props.message.mentionedName !== 'noName') {
            return (
                <p className={styles.message}>
                    {messagesArray.map((word, index) => (
                        <span
                            key={index}
                            className={` ${
                                word === props.message.mentionedName
                                    ? styles.mention_message
                                    : styles.message
                            }`}
                        >
                            {'' + word}
                        </span>
                    ))}
                </p>
            );
        } else {
            return (
                <p className={styles.message}>
                    {props.message.message}
                    {}
                </p>
            );
        }
    }

    return (
        <div className={styles.sent_message_body}>
            <div className={styles.avatar_image}>
                <img src={noAvatarImage} alt='no avatar' />
            </div>
            <div className={styles.message_item}>
                <PositionBox
                    message={props.message.message}
                    isInput={false}
                    isPosition={isPosition}
                    setIsPosition={setIsPosition}
                />
                {!isPosition && mentionedMessage()}
            </div>
            <p className={styles.message_date}>{formatAMPM(props.message.createdAt)}</p>
        </div>
    );
}
