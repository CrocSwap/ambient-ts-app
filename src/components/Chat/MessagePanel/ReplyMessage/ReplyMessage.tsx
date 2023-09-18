import styles from './ReplyMessage.module.css';
import { motion } from 'framer-motion';
import { BooleanArraySupportOption } from 'prettier';
import { Dispatch, SetStateAction } from 'react';
import { IoIosClose } from 'react-icons/io';
import { GrClose } from 'react-icons/gr';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
interface propsIF {
    message: string | undefined;
    ensName: string;
    setIsReplyButtonPressed: Dispatch<SetStateAction<boolean>>;
    isReplyButtonPressed: boolean;
    time?: any;
    myJazzicon?: JSX.Element;
    walletID?: string;
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
    ) : props.message !== undefined ? (
        <motion.div>
            <div className={styles.replied_message_box}>
                <div className={styles.avatar_jazzicons}>
                    {props.myJazzicon}
                </div>

                <div className={styles.position_info}>
                    {props.ensName === 'defaultValue'
                        ? walletID
                        : props.ensName}

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
        <></>
    );
}
