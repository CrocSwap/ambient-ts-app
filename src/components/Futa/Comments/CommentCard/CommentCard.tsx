import { memo } from 'react';
import styles from './CommentCard.module.css';
import { Message } from '../../../Chat/Model/MessageModel';
import { getShownName } from '../../../Chat/ChatUtils';

interface CommentCardProps {
    message: Message;
}

function CommentCard(props: CommentCardProps) {
    return (
        <>
            <div className={styles.comment_card_wrapper}>
                <div className={styles.comment_top_info}>
                    {getShownName(props.message)}
                </div>
                <div className={styles.comment_text}>
                    {props.message.message}
                </div>
            </div>
        </>
    );
}
export default memo(CommentCard);
