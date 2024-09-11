import { Dispatch, SetStateAction } from 'react';
import { AiOutlineCheck } from 'react-icons/ai';
import { getAvatarFromMessageWithSize } from '../ChatRenderUtils';
import { getShownName } from '../ChatUtils';
import { Message } from '../Model/MessageModel';
import styles from './ChatNotificationBubble.module.css';
/* eslint-disable @typescript-eslint/no-explicit-any */

interface propsIF {
    message?: Message;
    replyListener?: (e: any) => void;
    setSelectedMessageForReply: Dispatch<SetStateAction<Message | undefined>>;
    setMessageForNotificationBubble: Dispatch<
        SetStateAction<Message | undefined>
    >;
    setIsReplyButtonPressed: Dispatch<SetStateAction<boolean>>;
    setRoom: Dispatch<SetStateAction<string>>;
}

export default function ChatNotificationBubble(props: propsIF) {
    return (
        <div
            className={`
            ${styles.bubble_wrapper} 
            ${props.message ? styles.active : ' '}
        `}
        >
            {props.message && (
                <>
                    <div className={styles.notification_title}>
                        <span className={styles.bold}>
                            {getShownName(props.message)}
                        </span>{' '}
                        has{' '}
                        {props.message?.repliedMessage
                            ? 'replied'
                            : 'mentioned'}{' '}
                        you in{' '}
                        <span className={styles.room_name}>
                            {props.message.roomInfo}
                        </span>
                    </div>
                    <div className={styles.message_wrapper}>
                        <div className={styles.message_top_info}>
                            <div className={styles.avatar}>
                                {getAvatarFromMessageWithSize(
                                    props.message,
                                    20,
                                )}
                            </div>
                            <div className={styles.name}>
                                {getShownName(props.message)}
                            </div>
                            {props.message.isVerified && (
                                <AiOutlineCheck
                                    className={styles.verification_icon}
                                    color='var(--other-green)'
                                    size={10}
                                />
                            )}
                        </div>
                        <div className={styles.message_body}>
                            {props.message.message}
                        </div>
                    </div>

                    <div className={styles.buttons_section}>
                        <div
                            className={
                                styles.btn_wrapper + ' ' + styles.primary_btn
                            }
                            onClick={() => {
                                props.setRoom(props.message?.roomInfo || '');
                                setTimeout(() => {
                                    props.setIsReplyButtonPressed(true);
                                    props.setSelectedMessageForReply(
                                        props.message,
                                    );
                                    props.setMessageForNotificationBubble(
                                        undefined,
                                    );
                                }, 200);
                                if (props.replyListener) {
                                    props.replyListener(props.message);
                                }
                            }}
                        >
                            Reply
                        </div>
                        <div
                            className={styles.btn_wrapper}
                            onClick={() => {
                                props.setMessageForNotificationBubble(
                                    undefined,
                                );
                            }}
                        >
                            Close
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
