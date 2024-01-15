import { motion } from 'framer-motion';
import { Dispatch, SetStateAction } from 'react';
import { GrClose } from 'react-icons/gr';
import styles from './ReplyMessage.module.css';
import { Message } from '../../Model/MessageModel';
import { formatMessageTime, getShownName } from '../../ChatUtils';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { TextOnlyTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import { AiOutlineCheck } from 'react-icons/ai';
interface propsIF {
    setIsReplyButtonPressed: Dispatch<SetStateAction<boolean>>;
    isReplyButtonPressed: boolean;
    currentUserId?: string;
    messageObj?: Message;
}

export default function ReplyMessage(props: propsIF) {
    function truncateText(text: string | undefined, maxLength: number) {
        if (text!.length <= maxLength) {
            return text;
        }

        return text!.slice(0, maxLength - 3) + '...';
    }

    const replyJazzIcon = (
        <Jazzicon
            svgStyles={{ marginBottom: '8px' }}
            diameter={10}
            seed={jsNumberForAddress(
                props.messageObj?.walletID ? props.messageObj.walletID : '',
            )}
        />
    );

    const renderMsgContent = (shorten: boolean) => {
        if (props.messageObj?.isDeleted) {
            return (
                <>
                    <span className={styles.deleted_msg_text}>
                        This message has been deleted
                    </span>
                </>
            );
        } else {
            if (shorten) {
                return (
                    <div className={styles.message}>
                        <p>{truncateText(props.messageObj?.message, 25)}</p>
                    </div>
                );
            } else {
                return (
                    <div className={styles.message_content}>
                        {props.messageObj?.message}
                    </div>
                );
            }
        }
    };

    const renderVerificationIcon = () => {
        if (props.messageObj?.isVerified) {
            return (
                <>
                    <div className={styles.verified_icon}>
                        <AiOutlineCheck color='var(--other-green)' size={8} />
                    </div>
                </>
            );
        } else {
            return <></>;
        }
    };

    return props.isReplyButtonPressed === true && props.messageObj ? (
        <div style={{ marginTop: '10px' }} className={styles.reply_box}>
            <motion.div
                className={`${styles.animate_position_box}  `}
                key='content'
                initial='collapsed'
                animate='open'
                exit='collapsed'
                variants={{
                    open: { opacity: 1, height: 'auto' },
                    collapsed: { opacity: 0, height: 0 },
                }}
                transition={{ duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] }}
            >
                <div className={styles.avatar_jazzicons}>{replyJazzIcon}</div>

                <div
                    className={`${styles.shown_name}  ${
                        props.currentUserId == props.messageObj?.sender
                            ? styles.current_user_name
                            : styles.name
                    }`}
                >
                    {getShownName(props.messageObj)}
                    {renderVerificationIcon()}
                </div>

                <div className={styles.reply_panel_close_icon}>
                    <GrClose
                        size={16}
                        color='white'
                        style={{ cursor: 'pointer', color: 'white' }}
                        onClick={() => props.setIsReplyButtonPressed(false)}
                    />
                </div>
                <div className={styles.message}>{renderMsgContent(false)}</div>
                <div className={styles.reply_box_time}>
                    <p>{formatMessageTime(props.messageObj.createdAt)}</p>
                </div>
            </motion.div>
        </div>
    ) : props.messageObj ? (
        <motion.div>
            <TextOnlyTooltip
                title={
                    <div className={styles.message_tooltip_wrapper}>
                        <div className={styles.tooltip_top_info}>
                            <div className={styles.avatar_jazzicons}>
                                {replyJazzIcon}
                            </div>

                            <div
                                className={`${styles.shown_name}  ${
                                    props.currentUserId ==
                                    props.messageObj?.sender
                                        ? styles.current_user_name
                                        : styles.name
                                }`}
                            >
                                {getShownName(props.messageObj)}
                                {renderVerificationIcon()}
                            </div>
                            <div className={styles.tooltip_message_time}>
                                {formatMessageTime(props.messageObj.createdAt)}
                            </div>
                        </div>
                        <div className={styles.tooltip_message_content}>
                            {renderMsgContent(false)}
                        </div>
                    </div>
                }
                enterDelay={20}
                placement='top'
            >
                <div className={styles.replied_message_box}>
                    <div className={styles.tooltip_top_info}>
                        <div className={styles.avatar_jazzicons}>
                            {replyJazzIcon}
                        </div>

                        <div
                            className={`${styles.shown_name}  ${
                                props.currentUserId == props.messageObj?.sender
                                    ? styles.current_user_name
                                    : styles.name
                            }`}
                        >
                            {getShownName(props.messageObj)}
                        </div>
                        {renderVerificationIcon()}
                        <div></div>

                        <div className={styles.tooltip_message_time}>
                            <p>
                                {formatMessageTime(props.messageObj.createdAt)}
                            </p>
                        </div>
                    </div>

                    {renderMsgContent(true)}
                </div>
            </TextOnlyTooltip>
        </motion.div>
    ) : (
        <>
            <span className={styles.deleted_msg_text}>
                This message has been deleted
            </span>
        </>
    );
}
