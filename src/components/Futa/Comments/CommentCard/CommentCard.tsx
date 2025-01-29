import { CSSProperties, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    formatMessageTime,
    formatURL,
    getDateLabelInfo,
    getRedirectTargetFromMessage,
    getShownName,
    handleOpenExplorerAddHttp,
    isLinkInCrocodileLabsLinksForInput,
    isValidUrl,
    minToMS,
} from '../../../Chat/ChatUtils';
import { Message } from '../../../Chat/Model/MessageModel';
import styles from './CommentCard.module.css';

interface CommentCardProps {
    message: Message;
    previousMessage?: Message;
    currentUserID: string;
    style?: CSSProperties;
}

function CommentCard(props: CommentCardProps) {
    const navigate = useNavigate();

    const getExactDate = (day: Date) => {
        return (
            day.getUTCMonth().toString() +
            day.getUTCDate().toString() +
            day.getUTCFullYear().toString()
        );
    };

    const assignDayInfo = () => {
        let hasDayInfo = false;
        const messageDate = new Date(props.message.createdAt);
        if (props.previousMessage) {
            const prevMessageDate = new Date(props.previousMessage.createdAt);
            if (getExactDate(messageDate) !== getExactDate(prevMessageDate)) {
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

        props.message.message.split(' ').map((e, index) => {
            if (isLinkInCrocodileLabsLinksForInput(e) && isValidUrl(e)) {
                ret.push(
                    <span
                        key={props.message._id + index}
                        onClick={() => {
                            handleOpenExplorerAddHttp(e);
                        }}
                        className={`${styles.comment_content_token} ${styles.link_token}`}
                    >
                        {formatURL(e)}
                    </span>,
                );
            } else {
                ret.push(
                    <span
                        key={props.message._id + index}
                        className={styles.comment_content_token}
                    >
                        {e}
                    </span>,
                );
            }
        });

        return ret;
    };

    const handleProfileRedirection = () => {
        if (props.message.sender === props.currentUserID) {
            navigate('/account');
        } else {
            navigate(`/${getRedirectTargetFromMessage(props.message)}`);
        }
    };

    const dayInfo = assignDayInfo();
    const isBasic = isBasicCard();

    return (
        <>
            <div
                id={`comment_${props.message._id}`}
                key={`comment_key_${props.message._id}`}
                className={`commentBubble ${styles.comment_card_wrapper} ${isBasic ? styles.basic_card : ' '} ${props.message.isUnread ? styles.unread + ' unreadComment' : ' '}`}
                data-message-id={props.message._id}
                style={props.style ? props.style : {}}
            >
                {dayInfo && dayInfo.length > 0 && (
                    <div className={styles.comment_top_info}>{dayInfo}</div>
                )}
                {!isBasic && (
                    <div
                        onClick={handleProfileRedirection}
                        className={`${styles.comment_sender_info} ${props.message.sender === props.currentUserID ? styles.is_user : ' '}`}
                    >
                        {getShownName(props.message)}
                    </div>
                )}
                <div
                    key={props.message._id + 'renderedContent'}
                    className={styles.comment_text}
                >
                    {renderContent()}
                </div>
                <div className={styles.comment_bottom_info}>
                    {formatMessageTime(props.message.createdAt)}
                </div>
            </div>
        </>
    );
}
export default memo(CommentCard);
