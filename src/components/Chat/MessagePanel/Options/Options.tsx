import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { AiOutlineDelete, AiOutlineRotateLeft } from 'react-icons/ai';
import { BsEmojiSmile, BsFillReplyFill } from 'react-icons/bs';
import { SlOptions } from 'react-icons/sl';
import { TextOnlyTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import { Message } from '../../Model/MessageModel';
import styles from './Options.module.css';
interface propsIF {
    setIsReplyButtonPressed: Dispatch<SetStateAction<boolean>>;
    isReplyButtonPressed: boolean;
    setSelectedMessageForReply: Dispatch<SetStateAction<Message | undefined>>;
    message: Message | undefined;
    addReactionListener: (message?: Message) => void;
    tooltipTop: boolean;
    isUserVerified: boolean;
    isModerator: boolean;
    isUsersMessage: boolean;
    tsForRefresh: number;
    setFlipped: (val: boolean) => void;
    deleteMessageFromList: (id: string) => void;
    showDeleteConfirmation: boolean;
    setShowDeleteConfirmation: Dispatch<SetStateAction<boolean>>;
    selectedMessageIdForDeletion: string;
    setSelectedMessageIdForDeletion: Dispatch<SetStateAction<string>>;
}
export default function Options(props: propsIF) {
    const [showDetailsGroup, setShowDetailsGroup] = useState(false);

    const showFlipCard = false;
    const showMore = false;

    function setReplyMessage() {
        props.setIsReplyButtonPressed(!props.isReplyButtonPressed);
        props.setSelectedMessageForReply(props.message);
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

    const options = (
        <SlOptions
            size={14}
            className={styles.options_button}
            // onClick={() => setIsMoreButtonPressed(!isMoreButtonPressed)}
            onClick={() => setShowDetailsGroup(!showDetailsGroup)}
        />
    );

    const addReaction = (
        <BsEmojiSmile
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
                    onClick={() => {
                        props.setShowDeleteConfirmation(true);
                        props.setSelectedMessageIdForDeletion(
                            props.message ? props.message._id : '',
                        );
                    }}
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
    return (
        <>
            <div key={props.tsForRefresh}>
                <div className={styles.dropdown_item}>
                    {ReplyWithTooltip}
                    {(props.isUsersMessage && props.isUserVerified) ||
                    (props.isModerator && props.isUserVerified) ? (
                        deleteMessage
                    ) : (
                        <></>
                    )}
                    {showFlipCard && flipCard}
                    {addReactionWithTooltip}
                    {showMore && optionsWithTooltip}
                </div>
            </div>
        </>
    );
}
