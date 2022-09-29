import styles from './IncomingMessage.module.css';
import noAvatarImage from '../../../../assets/images/icons/avatar.svg';
import { Message } from '../../Model/MessageModel';

export interface IncomingMessageProps {
    message: Message;
}
export default function IncomingMessage(props: IncomingMessageProps) {
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
        <div className={styles.income_message}>
            <div className={styles.avatar_image}>
                <img src={noAvatarImage} alt='no avatar' />
            </div>
            <div className={styles.message_body}>
                <div className={styles.name}>name</div>
                <p className={styles.message}>{props.message.message}</p>
            </div>
            <p className={styles.message_date}>{formatAMPM(props.message.createdAt)}</p>
        </div>
    );
}
