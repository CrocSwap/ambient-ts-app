import { Dispatch, SetStateAction } from 'react';
import styles from './Menu.module.css';
import { FiArrowLeft, FiDelete, FiInfo, FiRotateCw } from 'react-icons/fi';
import { BsFillReplyFill, BsEmojiSmileUpsideDown } from 'react-icons/bs';
import useChatApi from '../../../Service/ChatApi';
import { Message } from '../../../Model/MessageModel';
interface propsIF {
    isMessageDeleted: boolean;
    setIsMessageDeleted: Dispatch<SetStateAction<boolean>>;
    setIsMoreButtonPressed: Dispatch<SetStateAction<boolean>>;
    setFlipped: Dispatch<SetStateAction<boolean>>;
    deleteMsgFromList: any;
    id: string;
    setIsReplyButtonPressed: Dispatch<SetStateAction<boolean>>;
    isReplyButtonPressed: boolean;
    replyMessageContent: Message | undefined;
    setReplyMessageContent: Dispatch<SetStateAction<Message | undefined>>;
    message: Message | undefined;
    addReactionListener: (message?: Message) => void;
    isUserVerified: boolean;
    isModerator: boolean;
    isUsersMessage: boolean;
    riseToBottom: boolean;
}
export default function Menu(props: propsIF) {
    const deleteMessageListener = () => {
        props.deleteMsgFromList(props.id);
    };

    const setReplyMessage = () => {
        props.setIsReplyButtonPressed(!props.isReplyButtonPressed);
        props.setReplyMessageContent(props.message);
    };

    const addReaction = () => {
        props.addReactionListener(props.message);
    };

    const options = [
        // CHAT_FEATURES_WBO - Feature : Reply Message
        // {
        //     label: 'Reply',
        //     icon: <BsFillReplyFill size={10} />,
        //     listener: setReplyMessage,
        // },
        //  CHAT_FEATURES_WBO - Feature: Add Reaction
        // {
        //     label: 'Add Reaction',
        //     icon: <BsEmojiSmileUpsideDown size={10} />,
        //     listener: addReaction,
        // },
        {
            label: 'Delete',
            icon: <FiDelete size={10} />,
            listener: deleteMessageListener,
        },

        //  CHAT_FEATURES_WBO - Feature: Like & Dislike
        // {
        //     label: 'Details',
        //     icon: <FiArrowLeft size={10} />,
        //     listener: () => props.setFlipped(true),
        // },
    ];

    const filteredOptions =
        !(props.isUsersMessage && props.isUserVerified) &&
        !(props.isModerator && props.isUserVerified)
            ? options.filter((option) => option.label !== 'Delete')
            : options;

    return (
        <>
            {filteredOptions.length > 0 && (
                <div
                    className={`${styles.dropdown_item}
            ${props.riseToBottom ? styles.rise_to_bottom : ''}
            `}
                    onMouseOver={() => {
                        props.setIsMoreButtonPressed(true);
                    }}
                    onMouseEnter={() => {
                        props.setIsMoreButtonPressed(true);
                    }}
                    onMouseLeave={() => {
                        props.setIsMoreButtonPressed(false);
                    }}
                >
                    {filteredOptions.map((option, index) => {
                        return (
                            <>
                                <div
                                    className={styles.dropdown_node}
                                    onClick={() => {
                                        if (option.listener) option.listener();
                                    }}
                                    style={{
                                        animationDelay: `${
                                            (options.length - index - 1) * 0.1
                                        }s`,
                                    }}
                                >
                                    <div className={styles.dropdown_node_icon}>
                                        {option.icon}
                                    </div>
                                    <div className={styles.dropdown_node_label}>
                                        {option.label}
                                    </div>
                                </div>
                            </>
                        );
                    })}

                    {/*             
                <BsFillReplyFill size={10} />
                <BsEmojiSmileUpsideDown size={10} />
                <FiDelete
                    size={10}
                    color='red'
                    onClick={() => {
                        closePanel();
                    }}
                /> */}
                </div>
            )}
        </>
    );
}
