import styles from './SentMessagePanel.module.css';
import { Message } from '../../Model/MessageModel';
import PositionBox from '../PositionBox/PositionBox';
import { useState } from 'react';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import SnackbarComponent from '../../../Global/SnackbarComponent/SnackbarComponent';
import Blockies from 'react-blockies';
import { FiDelete } from 'react-icons/fi';

interface SentMessageProps {
    message: Message;
    ensName: string;
    isCurrentUser: boolean;
    currentUser: string | undefined;
    userImageData: string[];
    resolvedAddress: string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connectedAccountActive: any;
    isUserLoggedIn: boolean;
    moderator: boolean;
}

export default function SentMessagePanel(props: SentMessageProps) {
    const [isPosition, setIsPosition] = useState(false);

    // const { userImageData } = props;

    const formatAMPM = (str: string) => {
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

    function getName() {
        if (
            props.message.ensName === 'defaultValue' ||
            props.message.ensName === null ||
            props.message.ensName === undefined
        ) {
            return props.message.walletID.slice(0, 6) + '...';
        } else {
            return props.message.ensName;
        }
    }

    const [value, copy] = useCopyToClipboard();
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const snackbarContent = (
        <SnackbarComponent
            severity='info'
            setOpenSnackbar={setOpenSnackbar}
            openSnackbar={openSnackbar}
        >
            {value?.startsWith('0x') ? value.slice(0, 6) + '...' : value} copied
        </SnackbarComponent>
    );
    function handleCopyAddress(item: string) {
        copy(item);
        setOpenSnackbar(true);
    }

    function mentionedMessage() {
        const messagesArray = props.message.message.split(' ');
        if (props.message.isMentionMessage === true) {
            return (
                <p>
                    {messagesArray.map((word, index) => (
                        <span
                            key={index}
                            className={` ${
                                props.isUserLoggedIn
                                    ? word.slice(1) === props.ensName ||
                                      word.slice(1) === props.connectedAccountActive
                                        ? styles.mention_message
                                        : styles.message
                                    : styles.message
                            }`}
                        >
                            {'' + word}
                        </span>
                    ))}
                </p>
            );
        } else {
            return <p className={styles.message}>{props.message.message}</p>;
        }
    }

    const myBlockies = <Blockies seed={props.message.walletID} scale={3} bgColor={'#171D27'} />;

    return (
        <div
            className={
                props.isUserLoggedIn
                    ? props.message.isMentionMessage === false
                        ? styles.sent_message_body
                        : props.message.mentionedName?.trim() === props.ensName?.trim() ||
                          props.message.mentionedName?.trim() ===
                              props.connectedAccountActive?.trim()
                        ? styles.sent_message_body_with_mention
                        : styles.sent_message_body
                    : styles.sent_message_body
            }
        >
            <div className={styles.nft_container}>
                {/* {userImageData[1] ? <img src={userImageData[1]} alt='nft' /> : null}
                {userImageData[2] ? <img src={userImageData[2]} alt='nft' /> : null}
                {userImageData[3] ? <img src={userImageData[3]} alt='nft' /> : null} */}
                {myBlockies}
            </div>
            <div className={styles.message_item}>
                <div
                    className={props.isCurrentUser ? styles.current_user_name : styles.name}
                    onClick={() =>
                        handleCopyAddress(
                            props.message.ensName === 'defaultValue'
                                ? props.message.walletID
                                : props.message.ensName,
                        )
                    }
                >
                    {getName()}
                </div>
                <PositionBox
                    message={props.message.message}
                    isInput={false}
                    isPosition={isPosition}
                    setIsPosition={setIsPosition}
                />
                {!isPosition && mentionedMessage()}
            </div>
            {props.moderator ? <FiDelete color='red' /> : ''}
            <p className={styles.message_date}>{formatAMPM(props.message.createdAt)}</p>

            {snackbarContent}
        </div>
    );
}
