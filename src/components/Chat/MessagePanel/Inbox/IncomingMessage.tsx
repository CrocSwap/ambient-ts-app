import styles from './IncomingMessage.module.css';
import noAvatarImage from '../../../../assets/images/icons/avatar.svg';
import { Message } from '../../Model/MessageModel';
import PositionBox from '../PositionBox/PositionBox';
import { useEffect, useState } from 'react';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import SnackbarComponent from '../../../Global/SnackbarComponent/SnackbarComponent';
import useChatApi from '../../Service/ChatApi';

export interface IncomingMessageProps {
    message: Message;
    name: string;
    isSequential: boolean;
}

export default function IncomingMessage(props: IncomingMessageProps) {
    const [isPosition, setIsPosition] = useState(false);
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

    const [value, copy] = useCopyToClipboard();
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [minute, setMinute] = useState(1);
    const [isSequential, setIsSequential] = useState(false);

    function handleCopyAddress(item: string) {
        copy(item);
        setOpenSnackbar(true);
        console.log('handleCopy');
    }

    const snackbarContent = (
        <SnackbarComponent
            severity='info'
            setOpenSnackbar={setOpenSnackbar}
            openSnackbar={openSnackbar}
        >
            {value} copied
        </SnackbarComponent>
    );

    function interval(str: string, string: string) {
        const endDate = new Date(str);
        const purchaseDate = new Date(string);
        const diffMs = +endDate - +purchaseDate; // milliseconds
        const diffDays = Math.floor(diffMs / 86400000); // days
        const diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
        const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
        console.log(diffMins, ' min');
        return diffMins;
    }

    function namerOrWalletID(content: string) {
        if (content.includes('0x')) {
            return content.slice(0, 6) + '...';
        } else {
            return content;
        }
    }

    function mentionedMessage() {
        const messagesArray = props.message.message.split(' ');
        if (props.message.mentionedName !== 'noName') {
            return (
                <p className={styles.message}>
                    {messagesArray.map((word, index) => (
                        <span
                            key={index}
                            className={` ${
                                word === props.message.mentionedName
                                    ? styles.mention_message
                                    : styles.message
                            }`}
                        >
                            {'' + word}
                        </span>
                    ))}
                </p>
            );
        } else {
            return (
                <p className={styles.message}>
                    {props.message.message}
                    {}
                </p>
            );
        }
    }

    return (
        <div className={styles.income_message}>
            <div className={styles.message_body}>
                <div className={styles.avatar_image}>
                    <img src={noAvatarImage} alt='no avatar' />
                </div>

                <div className={styles.message_message}>
                    <div className={styles.name} onClick={() => handleCopyAddress(props.name)}>
                        {namerOrWalletID(props.name)}
                    </div>
                    {!isPosition && mentionedMessage()}

                    <PositionBox
                        message={props.message.message}
                        isInput={false}
                        isPosition={isPosition}
                        setIsPosition={setIsPosition}
                    />
                </div>

                <div className={styles.message_date}>{formatAMPM(props.message.createdAt)}</div>
            </div>
            {snackbarContent}
        </div>
    );
}
