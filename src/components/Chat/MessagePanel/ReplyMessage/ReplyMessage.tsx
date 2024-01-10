import { motion } from 'framer-motion';
import { Dispatch, SetStateAction } from 'react';
import { GrClose } from 'react-icons/gr';
import styles from './ReplyMessage.module.css';
import { Message } from '../../Model/MessageModel';
interface propsIF {
    message: string | undefined;
    ensName: string | undefined;
    setIsReplyButtonPressed: Dispatch<SetStateAction<boolean>>;
    isReplyButtonPressed: boolean;
    time?: any;
    myJazzicon?: JSX.Element;
    walletID?: string | undefined;
    repliedMessageEnsName?: string;
    currentUserId?: string;
    messageObj?: Message;
    getShownName: (message: Message) => string;
}

export default function ReplyMessage(props: propsIF) {
    const walletID = props.walletID?.slice(0, 6) + '...';
    function truncateText(text: string | undefined, maxLength: number) {
        if (text!.length <= maxLength) {
            return text;
        }

        return text!.slice(0, maxLength - 3) + '...';
    }
    return props.isReplyButtonPressed === true ? (
        <div style={{ marginTop: '10px' }}>
            <motion.div
                className={styles.animate_position_box}
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
                <div className={styles.position_main_box}>
                    <div className={styles.position_box}>
                        <div className={styles.stil}>
                            <div className={styles.position_info}>
                                {props.ensName === 'defaultValue'
                                    ? walletID
                                    : props.ensName}
                            </div>

                            <GrClose
                                size={8}
                                color='white'
                                style={{ cursor: 'pointer', color: 'white' }}
                                onClick={() =>
                                    props.setIsReplyButtonPressed(false)
                                }
                            />
                        </div>
                        <div className={styles.message}>
                            <p>{truncateText(props.message, 25)}</p>
                            <p>{props.time}</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    ) : props.messageObj ? (
        <motion.div>
            <div className={styles.replied_message_box}>
                <div className={styles.avatar_jazzicons}>
                    {props.myJazzicon}
                </div>

                <div
                    className={`${styles.shown_name}  ${
                        props.currentUserId == props.messageObj?.sender
                            ? styles.current_user_name
                            : styles.name
                    }`}
                >
                    {props.getShownName(props.messageObj)}
                </div>
                <div className={styles.position_info}>
                    {props.message === undefined || props.message === '' ? (
                        <GrClose
                            size={25}
                            color='white'
                            style={{ cursor: 'pointer', color: 'white' }}
                            onClick={() => props.setIsReplyButtonPressed(false)}
                        />
                    ) : (
                        ''
                    )}
                </div>
                <div className={styles.message}>
                    <p>{truncateText(props.message, 25)}</p>
                </div>
            </div>
        </motion.div>
    ) : (
        <>
            <span className={styles.deleted_msg_text}>
                This message has been deleted
            </span>
        </>
    );
}
