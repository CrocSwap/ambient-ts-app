import { memo } from 'react';
import styles from './CommentCard.module.css';
import { Message } from '../../../Chat/Model/MessageModel';
import {
    formatMessageTime,
    getDateLabelInfo,
    getShownName,
} from '../../../Chat/ChatUtils';

interface CommentCardProps {
    message: Message;
    previousMessage?: Message;
    currentUserID: string;
}

function CommentCard(props: CommentCardProps) {
    const assignDayInfo = () => {
        let hasDayInfo = false;
        const messageDate = new Date(props.message.createdAt);
        if (props.previousMessage) {
            const prevMessageDate = new Date(props.previousMessage.createdAt);
            if (messageDate.getDay() != prevMessageDate.getDay()) {
                hasDayInfo = true;
            }
        } else {
            hasDayInfo = true;
        }
        return hasDayInfo ? getDateLabelInfo(messageDate) : '';
    };

    const dayInfo = assignDayInfo();

    return (
        <>
            <div className={styles.comment_card_wrapper}>
                {dayInfo && dayInfo.length > 0 && (
                    <div className={styles.comment_top_info}>{dayInfo}</div>
                )}

                <div
                    className={`${styles.comment_sender_info} ${props.message.sender === props.currentUserID ? styles.is_user : ' '}`}
                >
                    {getShownName(props.message)}
                </div>
                <div className={styles.comment_text}>
                    {props.message.message}
                </div>
                <div className={styles.comment_bottom_info}>
                    {formatMessageTime(props.message.createdAt)}
                </div>
            </div>
        </>
    );
}
export default memo(CommentCard);
