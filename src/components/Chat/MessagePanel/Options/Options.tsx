import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { BsEmojiSmileUpsideDown, BsFillReplyFill } from 'react-icons/bs';
import { SlOptions } from 'react-icons/sl';
import { TextOnlyTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import { Message } from '../../Model/MessageModel';
import styles from './Options.module.css';
import { AiOutlineDelete, AiOutlineRotateLeft } from 'react-icons/ai';
interface propsIF {
    setIsReplyButtonPressed: Dispatch<SetStateAction<boolean>>;
    isReplyButtonPressed: boolean;
    replyMessageContent: Message | undefined;
    setReplyMessageContent: Dispatch<SetStateAction<Message | undefined>>;
    message: Message | undefined;
    addReactionListener: (message?: Message) => void;
    tooltipTop: boolean;
    isUserVerified: boolean;
    isModerator: boolean;
    isUsersMessage: boolean;
    tsForRefresh: number;
    setFlipped: (val: boolean) => void;
    deleteMessageFromList: (id: string) => void;
}
export default function Options(props: propsIF) {
    const [showDetailsGroup, setShowDetailsGroup] = useState(false);

    console.log(props.tsForRefresh);
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

    useEffect(() => {
        setShowDetailsGroup(false);
    }, [props.tsForRefresh]);

    // Create a ref to the outermost element of the dropdown
    const dropdownRef = useRef<HTMLDivElement>(null);
    // Add an event listener to handle clicks outside the dropdown

    console.log('showDetailsGroup', showDetailsGroup);
    const options = (
        <SlOptions
            size={14}
            className={styles.options_button}
            // onClick={() => setIsMoreButtonPressed(!isMoreButtonPressed)}
            onClick={() => setShowDetailsGroup(!showDetailsGroup)}
        />
    );

    const addReaction = (
        <BsEmojiSmileUpsideDown
            onClick={() => props.addReactionListener(props.message)}
            size={14}
        />
    );

    const flipCard = (
        <TextOnlyTooltip
            title={
                <div className={styles.id_tooltip_style}>
                    <span> {'Details'}</span>
                </div>
            }
            placement={props.tooltipTop ? 'top' : 'bottom'}
            enterDelay={100}
            leaveDelay={0}
        >
            <p
                className={`${styles.base_color} ${styles.hover_style} ${styles.mono_font} ${styles.options_node} ${styles.sub_options_node} `}
            >
                <AiOutlineRotateLeft
                    className=''
                    onClick={() => {
                        props.setFlipped(true);
                        setShowDetailsGroup(false);
                    }}
                    size={14}
                />
            </p>
        </TextOnlyTooltip>
    );

    const deleteMessage = (
        <TextOnlyTooltip
            title={
                <div className={styles.id_tooltip_style}>
                    <span> {'Delete Message'}</span>
                </div>
            }
            placement={props.tooltipTop ? 'top' : 'bottom'}
            enterDelay={100}
            leaveDelay={0}
        >
            <p
                className={`${styles.base_color} ${styles.hover_style} ${styles.mono_font} ${styles.options_node}  ${styles.sub_options_node} `}
            >
                <AiOutlineDelete
                    onClick={() =>
                        props.deleteMessageFromList(props.message?._id || '')
                    }
                    size={14}
                />
            </p>
        </TextOnlyTooltip>
    );

    const ReplyWithTooltip = (
        <TextOnlyTooltip
            title={
                <div className={styles.id_tooltip_style}>
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
            title={
                <div className={styles.id_tooltip_style}>
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
        //     title={
        //         <div
        //             className={styles.id_tooltip_style}
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
        <div key={props.tsForRefresh}>
            <div className={styles.dropdown_item}>
                {/* CHAT_FEATURES_WBO - Feature: Reply */}
                {/* {ReplyWithTooltip} */}
                {/* CHAT_FEATURES_WBO - Feature: Add Reaction */}
                {showDetailsGroup && (
                    <>
                        {deleteMessage}
                        {flipCard}
                    </>
                )}
                {addReactionWithTooltip}
                {optionsWithTooltip}
            </div>
        </div>
    );
}
