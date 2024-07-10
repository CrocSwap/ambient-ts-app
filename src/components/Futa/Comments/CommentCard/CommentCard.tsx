import { memo } from 'react';
import styles from './CommentCard.module.css';
import { Message } from '../../../Chat/Model/MessageModel';
import {
    formatMessageTime,
    getDateLabelInfo,
    getShownName,
    handleOpenExplorerAddHttp,
    isLinkInCrocodileLabsLinksForInput,
    isValidUrl,
    minToMS,
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

    const isBasicCard = () => {
        let ret = false;
        if (props.previousMessage) {
            try {
                const prevMsgTime = new Date(
                    props.previousMessage.createdAt,
                ).getTime();
                const currMsgTime = new Date(props.message.createdAt).getTime();
                ret =
                    props.previousMessage.sender == props.message.sender &&
                    currMsgTime - prevMsgTime <= 5 * minToMS;
            } catch (e) {
                console.log(e);
            }
        }
        return ret;
    };

    const renderContent = () => {
        const ret = [<></>];

        props.message.message.split(' ').map((e) => {
            if (isLinkInCrocodileLabsLinksForInput(e) && isValidUrl(e)) {
                ret.push(
                    <span
                        onClick={() => {
                            handleOpenExplorerAddHttp(e);
                        }}
                        className={`${styles.comment_content_token} ${styles.link_token}`}
                    >
                        {e}
                    </span>,
                );
            } else {
                ret.push(
                    <span className={styles.comment_content_token}>{e}</span>,
                );
            }
        });

        return ret;
    };

    const dayInfo = assignDayInfo();
    const isBasic = isBasicCard();

    return (
        <>
            <div
                className={`${styles.comment_card_wrapper} ${isBasic ? styles.basic_card : ' '}`}
            >
                {dayInfo && dayInfo.length > 0 && (
                    <div className={styles.comment_top_info}>{dayInfo}</div>
                )}
                {!isBasic && (
                    <div
                        className={`${styles.comment_sender_info} ${props.message.sender === props.currentUserID ? styles.is_user : ' '}`}
                    >
                        {getShownName(props.message)}
                    </div>
                )}
                <div className={styles.comment_text}>{renderContent()}</div>
                <div className={styles.comment_bottom_info}>
                    {formatMessageTime(props.message.createdAt)}
                </div>
            </div>
        </>
    );
}
export default memo(CommentCard);
