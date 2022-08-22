import styles from './SentMessagePanel.module.css';
import noAvatarImage from '../../../../assets/images/icons/avatar.svg';
import { Message } from '../../Model/MessageModel';

interface SentMessageProps {
    message: Message;
}

export default function SentMessagePanel(props: SentMessageProps) {
    return (
        <div className={styles.sent_message_body}>
            <p className={styles.message_date}>2:41pm</p>

            <p className={styles.message}>{props.message.message}</p>

            <div className={styles.avatar_image}>
                <img src={noAvatarImage} alt='no avatar' />
            </div>
        </div>
    );
}
