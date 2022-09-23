import styles from './IncomingMessage.module.css';
import noAvatarImage from '../../../../assets/images/icons/avatar.svg';
import { Message } from '../../Model/MessageModel';

export interface IncomingMessageProps {
    message: Message;
}
export default function IncomingMessage(props: IncomingMessageProps) {
    return (
        <div className={styles.income_message}>
            <div className={styles.avatar_image}>
                <img src={noAvatarImage} alt='no avatar' />
            </div>

            <div className={styles.message_body}>
                <div className={styles.name}>name</div>
                <p className={styles.message}>{props.message.message}</p>
            </div>

            <p className={styles.message_date}>{props.message.createdAt}</p>
        </div>
    );
}
