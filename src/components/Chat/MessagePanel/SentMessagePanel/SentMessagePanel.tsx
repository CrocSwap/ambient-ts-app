import styles from './SentMessagePanel.module.css';
import noAvatarImage from '../../../../assets/images/icons/avatar.svg';
import { Message } from '../../Model/MessageModel';
import PositionBox from '../PositionBox/PositionBox';

interface SentMessageProps {
    message: Message;
}

export default function SentMessagePanel(props: SentMessageProps) {
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
            <div className={styles.message_item}>
                <PositionBox message={props.message.message} />

                <p className={styles.message}>{props.message.message}</p>
            </div>

            <div className={styles.right_image_box}>
                <div className={styles.avatar_image}>
                    <img src={noAvatarImage} alt='no avatar' />
                    <p className={styles.message_date}>{formatAMPM(props.message.createdAt)}</p>
                </div>
            </div>
        </div>
    );
}
