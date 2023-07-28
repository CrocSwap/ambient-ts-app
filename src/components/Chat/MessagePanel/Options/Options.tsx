import { Dispatch, SetStateAction } from 'react';
import styles from './Options.module.css';
import { BsFillReplyFill, BsEmojiSmileUpsideDown } from 'react-icons/bs';
import { Message } from '../../Model/MessageModel';
import { SlOptions } from 'react-icons/sl';
import {
    DefaultTooltip,
    TextOnlyTooltip,
} from '../../../Global/StyledTooltip/StyledTooltip';
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

    const reply = (
        <BsFillReplyFill
            size={10}
            style={{ cursor: 'pointer' }}
            onClick={() => setReplyMessage()}
        />
    );

    const options = <SlOptions className={styles.options_button} />;

    const addReaction = <BsEmojiSmileUpsideDown />;

    const ReplyWithTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <div
                    className={styles.id_tooltip_style}
                    onClick={(event) => event.stopPropagation()}
                >
                    <span> {'Reply'}</span>
                </div>
            }
            placement={'top'}
            enterDelay={750}
            leaveDelay={0}
        >
            <p
                data-label='id'
                className={`${styles.base_color} ${styles.hover_style} ${styles.mono_font}`}
                tabIndex={0}
            >
                {reply}
            </p>
        </TextOnlyTooltip>
    );
    const addReactionWithTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <div
                    className={styles.id_tooltip_style}
                    onClick={(event) => event.stopPropagation()}
                >
                    <span> {'Add Reaction'}</span>
                </div>
            }
            placement={'top'}
            enterDelay={750}
            leaveDelay={0}
        >
            <p
                data-label='id'
                className={`${styles.base_color} ${styles.hover_style} ${styles.mono_font}`}
                tabIndex={0}
            >
                {addReaction}
            </p>
        </TextOnlyTooltip>
    );
    const optionsWithTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <div
                    className={styles.id_tooltip_style}
                    onClick={(event) => event.stopPropagation()}
                >
                    <span> {'Options'}</span>
                </div>
            }
            placement={'top'}
            enterDelay={750}
            leaveDelay={0}
        >
            <p
                data-label='id'
                className={`${styles.base_color} ${styles.hover_style} ${styles.mono_font}`}
                tabIndex={0}
            >
                {options}
            </p>
        </TextOnlyTooltip>
    );
    return (
        <div className={styles.dropdown_item}>
            {ReplyWithTooltip}
            {addReactionWithTooltip}
            {optionsWithTooltip}
        </div>
    );
}
