import { useAccount } from 'wagmi';
import { BsEmojiSmile } from 'react-icons/bs';
import { Message } from '../../Model/MessageModel';

import Picker from 'emoji-picker-react';
import styles from './MessageInput.module.css';
import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from 'react';
import PositionBox from '../PositionBox/PositionBox';

import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { RiCloseFill, RiInformationLine } from 'react-icons/ri';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import MentionAutoComplete from './MentionAutoComplete/MentionAutoComplete';
import { User } from '../../Model/UserModel';
import ReplyMessage from '../ReplyMessage/ReplyMessage';
interface MessageInputProps {
    currentUser: string;
    message?: Message;
    room: string;
    ensName: string;
    appPage?: boolean;
    sendMsg: (
        currentUser: string,
        msg: string,
        room: string,
        ensName: string,
        walletID: string | null,
        replyMessageContent?: string | undefined,
        repliedMessageRoomInfo?: string | undefined,
    ) => void;
    inputListener?: (e: string) => void;
    users: User[];
    isLinkInCrocodileLabsLinks(word: string): boolean;
    isLink(url: string): boolean;
    filterMessage(message: string): boolean;
    showPopUp: boolean;
    setShowPopUp: Dispatch<SetStateAction<boolean>>;
    formatURL(url: string): string;
    isLinkInCrocodileLabsLinksForInput(word: string): boolean;
    setPopUpText: Dispatch<SetStateAction<string>>;
    popUpText: string;
    isReplyButtonPressed: boolean;
    setIsReplyButtonPressed: Dispatch<SetStateAction<boolean>>;
    replyMessageContent: Message | undefined;
    setReplyMessageContent: Dispatch<SetStateAction<Message | undefined>>;
}

export default function MessageInput(props: MessageInputProps) {
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isInfoPressed, setIsInfoPressed] = useState(false);
    const { address, isConnected } = useAccount();
    const [isPosition, setIsPosition] = useState(false);
    const {
        chat: { isOpen: isChatOpen },
        subscriptions: { isEnabled: isSubscriptionsEnabled },
    } = useContext(AppStateContext);

    const userData = useAppSelector((state) => state.userData);
    const isUserLoggedIn = userData.isLoggedIn;

    const [mentPanelActive, setMentPanelActive] = useState(false);
    const [mentPanelQueryStr, setMentPanelQueryStr] = useState('');
    const [possibleMentUser, setPossibleMentUser] = useState<User | null>(null);
    const [isExceedingMaxLength, setIsExceedingMaxLength] = useState(false);

    const roomId = props.room;

    const isRoomAdmins = roomId === 'Admins';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEmojiClick = (event: any, emoji: any) => {
        let msg = message;
        msg += emoji.emoji;
        setMessage(msg);
        // if(msg.length >= 140)
        // {
        //     event.preventDefault(); // Prevent further input when the limit is reached
        //     props.setShowPopUp(true);
        //     props.setPopUpText('Maximum length exceeded (140 characters limit).');

        // }
    };

    const handleEmojiPickerHideShow = () => {
        if (!isUserLoggedIn) {
            setShowEmojiPicker(false);
        } else {
            setShowEmojiPicker(!showEmojiPicker);
        }
    };

    const dontShowEmojiPanel = () => {
        setShowEmojiPicker(false);
    };

    function messageInputText() {
        if (isConnected && address) {
            return 'Type to chat. Enter to submit.';
        } else {
            return 'Please log in to chat.';
        }
    }

    useEffect(() => {
        messageInputText();
    }, [isConnected, address]);

    const handleSendMessageButton = () => {
        if (message === '') {
            return;
        }
        if (
            (props.isLink(message) || props.filterMessage(message)) &&
            !props.isLinkInCrocodileLabsLinksForInput(message)
        ) {
            props.setShowPopUp(true);
            props.setPopUpText('You cannot send this link.');
        } else {
            handleSendMsg(props.formatURL(message), roomId);
            setMessage('');
            dontShowEmojiPanel();
            props.setShowPopUp(false);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _handleKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            if (
                (props.isLink(message) || props.filterMessage(message)) &&
                !props.isLinkInCrocodileLabsLinksForInput(message)
            ) {
                props.setShowPopUp(true);
                props.setPopUpText('You cannot send this link.');
            } else {
                handleSendMsg(message, roomId);
                setMessage('');
                dontShowEmojiPanel();
                props.setShowPopUp(false);
            }
        } else if (
            mentPanelActive &&
            (e.key === 'ArrowUp' || e.key === 'ArrowDown')
        ) {
            e.preventDefault();
            if (possibleMentUser === null) {
                setPossibleMentUser(
                    props.users[
                        e.key === 'ArrowUp' ? props.users.length - 1 : 0
                    ],
                );
            } else {
                const index = props.users.indexOf(possibleMentUser);
                const targetIndex = e.key === 'ArrowUp' ? index - 1 : index + 1;
                setPossibleMentUser(
                    props.users[
                        targetIndex < 0
                            ? props.users.length - 1
                            : targetIndex == props.users.length
                            ? 0
                            : targetIndex
                    ],
                );
            }
        } else if (e.key !== 'Backspace' && e.target.value.length >= 140) {
            props.setShowPopUp(true);
            props.setShowPopUp(true);
            props.setPopUpText(
                'Maximum length exceeded (140 characters limit).',
            );
            e.preventDefault(); // Prevent further input when the limit is reached
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function openEmojiPanel(e: any) {
        if (e.keyCode === 88 && e.altKey) {
            setShowEmojiPicker(true);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function closeEmojiPanel(e: any) {
        if (e.keyCode === 81 && e.altKey) {
            setShowEmojiPicker(false);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function openInfo(e: any) {
        if (e.keyCode === 77 && e.ctrlKey) {
            setShowEmojiPicker(true);
            setIsInfoPressed(true);
        }
    }

    useEffect(() => {
        document.body.addEventListener('keydown', openEmojiPanel);
        document.body.addEventListener('keydown', closeEmojiPanel);
        document.body.addEventListener('keydown', openInfo);

        return function cleanUp() {
            document.body.removeEventListener('keydown', openEmojiPanel);
        };
    });

    const handleSendMsg = async (msg: string, roomId: string) => {
        if (msg !== '' && address) {
            if (
                (isRoomAdmins && props.replyMessageContent === undefined) ||
                props.replyMessageContent?.roomInfo !== 'Admins'
            ) {
                console.log(
                    'evet',
                    isRoomAdmins,
                    props.replyMessageContent,
                    props.replyMessageContent?.roomInfo,
                );
                props.sendMsg(
                    props.currentUser,
                    message,
                    props.replyMessageContent?.roomInfo as string,
                    props.ensName,
                    address,
                    props.replyMessageContent !== undefined
                        ? props.replyMessageContent?._id
                        : undefined,
                );
            } else {
                console.log('bu mu');
                props.sendMsg(
                    props.currentUser,
                    message,
                    roomId,
                    props.ensName,
                    address,
                    props.replyMessageContent !== undefined
                        ? props.replyMessageContent?._id
                        : undefined,
                );
            }
        }
        props.setIsReplyButtonPressed(false);
        props.setReplyMessageContent(undefined);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onChangeMessage = async (e: any) => {
        setMessage(e.target.value);
        props.setShowPopUp(false);
        if (e.target.value.indexOf('@') !== -1) {
            setMentPanelActive(true);
            setMentPanelQueryStr(e.target.value.split('@')[1]);
        } else {
            if (mentPanelActive) {
                setMentPanelActive(false);
            }
        }
    };

    const mentionAutoComplete = (
        <MentionAutoComplete
            userList={props.users}
            active={mentPanelActive}
            queryStr={mentPanelQueryStr}
            selectedUser={possibleMentUser}
        />
    );

    return (
        <div
            className={
                !isConnected ? styles.input_box_not_allowed : styles.input_box
            }
        >
            <PositionBox
                message={message}
                isInput={true}
                isPosition={isPosition}
                setIsPosition={setIsPosition}
                walletExplorer={
                    props.ensName === undefined ? address : props.ensName
                }
            />
            <div>
                {props.isReplyButtonPressed ? (
                    <ReplyMessage
                        message={props.replyMessageContent?.message}
                        ensName={props.ensName}
                        setIsReplyButtonPressed={props.setIsReplyButtonPressed}
                        isReplyButtonPressed={props.isReplyButtonPressed}
                    />
                ) : (
                    ''
                )}
            </div>
            <div
                className={
                    !isConnected ? styles.input_not_allowed : styles.input
                }
            >
                <input
                    type='text'
                    id='box'
                    placeholder={messageInputText()}
                    disabled={!isConnected}
                    className={
                        !isConnected
                            ? styles.input_text_not_allowed
                            : styles.input_text
                    }
                    onKeyDown={_handleKeyDown}
                    value={message}
                    onChange={onChangeMessage}
                    autoComplete={'off'}
                    tabIndex={-1}
                    autoFocus={props.appPage}
                    maxLength={140}
                />

                <BsEmojiSmile
                    className={
                        isUserLoggedIn
                            ? styles.svgButton
                            : styles.not_LoggedIn_svgButton
                    }
                    onClick={handleEmojiPickerHideShow}
                />
                {}
                <div
                    className={
                        isUserLoggedIn
                            ? styles.send_message_button
                            : styles.not_LoggedIn_send_message_button
                    }
                    onClick={() => handleSendMessageButton()}
                >
                    <svg
                        width='16'
                        height='16'
                        viewBox='0 0 16 16'
                        fill='none'
                        xmlns='http://www.w3.org/2000/svg'
                    >
                        <path
                            d='M14.6663 1.3335L7.33301 8.66683M14.6663 1.3335L9.99967 14.6668L7.33301 8.66683M14.6663 1.3335L1.33301 6.00016L7.33301 8.66683'
                            stroke='#EBEBFF'
                            strokeOpacity='0.25'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className={
                                isUserLoggedIn
                                    ? styles.svgButton
                                    : styles.not_LoggedIn_svgButton
                            }
                            id='send message button'
                        />
                        <title>Send Message</title>
                    </svg>
                </div>
            </div>
            {showEmojiPicker && (
                <div className={styles.emojiPicker}>
                    <span className={styles.emoji_close_button}>
                        <RiCloseFill
                            size={20}
                            title='Close Emoji Picker'
                            onClick={() => setShowEmojiPicker(false)}
                            id='close emoji panel button'
                            style={{ cursor: 'pointer' }}
                        />
                    </span>
                    <span
                        className={styles.emoji_close_button}
                        onClick={() => setIsInfoPressed(!isInfoPressed)}
                        style={{ cursor: 'pointer' }}
                    >
                        <RiInformationLine title='Info' id='info' />
                    </span>
                    {isInfoPressed ? (
                        <ul>
                            <h5>Keyboard Shortcuts</h5>
                            <hr></hr>
                            <li>Ctrl + Alt + C - opens/closes chat</li>
                            <li>Esc- closes chat</li>
                            <li>
                                Alt + X - opens emoji panel when chat is open
                            </li>
                            <li>Alt+ Q - close emoji panel</li>
                            <li>Ctrl + M - opens info</li>
                            <li>Enter - sends message directly</li>
                        </ul>
                    ) : (
                        <Picker
                            pickerStyle={{
                                width: '100%',
                                height: '89%',
                            }}
                            onEmojiClick={handleEmojiClick}
                            disableSkinTonePicker={true}
                        />
                    )}
                </div>
            )}

            {mentionAutoComplete}
        </div>
    );
}
