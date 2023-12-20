import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { BsEmojiSmileUpsideDown, BsFillReplyFill } from 'react-icons/bs';
import { SlOptions } from 'react-icons/sl';
import { TextOnlyTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import { Message } from '../../Model/MessageModel';
import styles from './Options.module.css';
interface propsIF {
    setIsReplyButtonPressed: Dispatch<SetStateAction<boolean>>;
    isReplyButtonPressed: boolean;
    replyMessageContent: Message | undefined;
    setReplyMessageContent: Dispatch<SetStateAction<Message | undefined>>;
    message: Message | undefined;
    isMoreButtonPressed: boolean;
    setIsMoreButtonPressed: Dispatch<boolean>;
    addReactionListener: (message?: Message) => void;
    tooltipTop: boolean;
    isUserVerified: boolean;
    isModerator: boolean;
    isUsersMessage: boolean;
}
export default function Options(props: propsIF) {
    const { isMoreButtonPressed, setIsMoreButtonPressed } = props;

    function setReplyMessage() {
        props.setIsReplyButtonPressed(!props.isReplyButtonPressed);
        props.setReplyMessageContent(props.message);
    }

    const reply = (
        <BsFillReplyFill
            size={16}
            style={{ cursor: 'pointer' }}
            onClick={() => setReplyMessage()}
        />
    );

    // Create a ref to the outermost element of the dropdown
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsMoreButtonPressed(false);
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [setIsMoreButtonPressed]);
    // Add an event listener to handle clicks outside the dropdown

    const options = (
        <SlOptions
            size={14}
            className={styles.options_button}
            onClick={() => setIsMoreButtonPressed(!isMoreButtonPressed)}
        />
    );

    const addReaction = (
        <BsEmojiSmileUpsideDown
            onClick={() => props.addReactionListener(props.message)}
            size={14}
        />
    );

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
            placement={props.tooltipTop ? 'top' : 'bottom'}
            enterDelay={100}
            leaveDelay={0}
        >
            <p
                data-label='id'
                className={`${styles.base_color} ${styles.hover_style} ${styles.mono_font} ${styles.options_node}`}
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
            placement={props.tooltipTop ? 'top' : 'bottom'}
            enterDelay={100}
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
        // <TextOnlyTooltip
        //     interactive
        //     title={
        //         <div
        //             className={styles.id_tooltip_style}
        //             onClick={(event) => event.stopPropagation()}
        //         >
        //             <span> {'More'}</span>
        //         </div>
        //     }
        //     placement={props.tooltipTop ? 'top' : 'bottom'}
        //     enterDelay={100}
        //     leaveDelay={0}
        // >
        //     </TextOnlyTooltip>
        <p
            data-label='id'
            className={`${styles.base_color} ${styles.hover_style} ${styles.mono_font}`}
            tabIndex={0}
        >
            {options}
        </p>
    );
    return !(props.isUsersMessage && props.isUserVerified) &&
        !(props.isModerator && props.isUserVerified) ? (
        <>
            {/* CHAT_FEATURES_WBO - Feature : Add Reaction | Reply */}
            {/* This conditional rendering will be removed after opening other features. */}
        </>
    ) : (
        <div>
            <div className={styles.dropdown_item}>
                {/* CHAT_FEATURES_WBO - Feature: Reply */}
                {/* {ReplyWithTooltip} */}
                {/* CHAT_FEATURES_WBO - Feature: Add Reaction */}
                {/* {addReactionWithTooltip} */}
                {optionsWithTooltip}
            </div>
        </div>
    );
}
