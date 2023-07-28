import { Dispatch, SetStateAction } from 'react';
import styles from './Options.module.css';
import { BsFillReplyFill, BsEmojiSmileUpsideDown } from 'react-icons/bs';
import { Message } from '../../Model/MessageModel';
import { SlOptions } from 'react-icons/sl';
interface propsIF {
    setIsReplyButtonPressed: Dispatch<SetStateAction<boolean>>;
    isReplyButtonPressed: boolean;
    replyMessageContent: Message | undefined;
    setReplyMessageContent: Dispatch<SetStateAction<Message | undefined>>;
    message: Message | undefined;
}
export default function Options(props: propsIF) {
    function setReplyMessage() {
        props.setIsReplyButtonPressed(!props.isReplyButtonPressed);
        props.setReplyMessageContent(props.message);
    }
    return (
        <div className={styles.dropdown_item}>
            <BsFillReplyFill
                title='Reply Message'
                size={10}
                style={{ cursor: 'pointer' }}
                onClick={() => setReplyMessage()}
            />
            <BsEmojiSmileUpsideDown title='Add Reaction' />
            <SlOptions className={styles.options_button} title='Options' />
        </div>
    );
}
