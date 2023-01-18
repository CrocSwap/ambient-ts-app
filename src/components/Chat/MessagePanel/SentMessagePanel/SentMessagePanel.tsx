import styles from './SentMessagePanel.module.css';
import noAvatarImage from '../../../../assets/images/icons/avatar.svg';
import { Message } from '../../Model/MessageModel';
import PositionBox from '../PositionBox/PositionBox';
import { useEffect, useState } from 'react';
import useChatApi from '../../../../components/Chat/Service/ChatApi';
import { color } from 'd3';
import PortfolioBannerAccount from '../../../../components/Portfolio/PortfolioBanner/PortfolioBanner';

interface SentMessageProps {
    message: Message;
    name: string;
    isCurrentUser: boolean;
}

export default function SentMessagePanel(props: SentMessageProps) {
    const [isPosition, setIsPosition] = useState(false);
    const { receiveUsername, getNameOrWallet } = useChatApi();
    const [mentionedName, setMentionedName] = useState('');
    const [isMentionMessage, setIsMentionMessage] = useState(false);
    const message = '';

    function namerOrWalletID(content: string) {
        if (content.includes('0x')) {
            return content.slice(0, 6) + '...';
        } else {
            return content;
        }
    }
    useEffect(() => {
        console.log(props.name);
    }, [props.message.mentionedName]);

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
        <div
            className={
                props.message.mentionedName === 'noName'
                    ? styles.sent_message_body
                    : props.message.mentionedName === props.name
                    ? styles.sent_message_body_with_mention
                    : styles.sent_message_body_with_mention
            }
        >
            <div className={styles.avatar_image}>
                <img src={noAvatarImage} alt='no avatar' />
            </div>
            <div className={styles.message_item}>
                <div className={props.isCurrentUser ? styles.current_user_name : styles.name}>
                    {namerOrWalletID(props.name)}
                </div>
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
