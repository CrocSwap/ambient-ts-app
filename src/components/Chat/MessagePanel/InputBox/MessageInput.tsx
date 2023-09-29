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
    useRef,
    useState,
} from 'react';
import PositionBox from '../PositionBox/PositionBox';

import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { RiCloseFill, RiInformationLine } from 'react-icons/ri';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import MentionAutoComplete from './MentionAutoComplete/MentionAutoComplete';
import { User, getUserLabel, userLabelForFilter } from '../../Model/UserModel';
import ReplyMessage from '../ReplyMessage/ReplyMessage';
import CircularProgressBar from '../../../Global/OpenOrderStatus/CircularProgressBar';
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
        mentionedName: string | null,
        mentionedWalletID: string | null,
        replyMessageContent?: string | undefined,
        repliedMessageRoomInfo?: string | undefined,
    ) => void;
    inputListener?: (e: string) => void;
    users: User[];
    isLinkInCrocodileLabsLinks(word: string): boolean;
    isLink(url: string): boolean;
    isInputDisabled: boolean;
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
    sendMessageCooldown: number;
}

export default function MessageInput(props: MessageInputProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [cursorPosition, setCursorPosition] = useState<number | null>(null);

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
    const [inputLength, setInputLength] = useState(0);
    const [mentUser, setMentUser] = useState<User | null>(null);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

    const roomId = props.room;

    const isRoomAdmins = roomId === 'Admins';

    const handleEmojiClick = (event: any, emojiObject: any) => {
        if (inputRef.current) {
            const emoji = emojiObject.emoji;
            const currentMessage = message;

            const selectionStart = inputRef.current.selectionStart as number;

            // Create the new message by inserting the emoji at the selection start position
            const newMessage =
                currentMessage.slice(0, selectionStart) +
                emoji +
                currentMessage.slice(selectionStart);

            if (newMessage.length <= 140) {
                setMessage(newMessage);
                setInputLength(newMessage.length);

                // Calculate the new cursor position after emoji insertion
                const newCursorPosition = selectionStart + emoji.length;

                // Update the input value and set the cursor position
                inputRef.current.value = newMessage;
                inputRef.current.setSelectionRange(
                    newCursorPosition,
                    newCursorPosition,
                );

                // Ensure the cursor remains active by focusing on the input element
                inputRef.current.focus();
            } else {
                props.setShowPopUp(true);
                props.setPopUpText(
                    'Maximum length exceeded (140 characters limit).',
                );
            }
        }
    };

    const handleEmojiPickerHideShow = () => {
        if (!isUserLoggedIn || props.room === 'Admins') {
            setShowEmojiPicker(false);
        } else {
            setShowEmojiPicker(!showEmojiPicker);
        }
    };

    const dontShowEmojiPanel = () => {
        setShowEmojiPicker(false);
    };

    const filterUsers = (queryStr: string): User[] => {
        return props.users.filter((u) =>
            userLabelForFilter(u)
                .toLowerCase()
                .includes(queryStr.toLowerCase()),
        );
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

    useEffect(() => {
        if (inputRef.current !== null && cursorPosition !== null) {
            inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
        }
    }, [cursorPosition]);

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
            setMentUser(null);
            setPossibleMentUser(null);
            dontShowEmojiPanel();
            props.setShowPopUp(false);
        }
    };

    const handleInputChange = (e: any) => {
        const newMessage = e.target.value;
        setMessage(newMessage);
        setInputLength(newMessage.length);
        setCursorPosition(e.target.selectionStart);

        // Check if the message length is less than or equal to 140 characters,
        // and hide the pop-up message if it was shown previously
        if (newMessage.length <= 140) {
            props.setShowPopUp(false);
        }
    };

    const handleInputClick = (e: any) => {
        // Update cursor position when the user clicks inside the input field
        if (inputRef.current) {
            setCursorPosition(inputRef.current.selectionStart);
        }
    };
    const handleInputDoubleClick = () => {
        if (inputRef.current) {
            inputRef.current.select();
        }
    };

    const getEffectiveCursorPosition = () => {
        if (cursorPosition === null) {
            return null;
        }
        const currentMessage = message.slice(0, cursorPosition);
        const emojiCount = (currentMessage.match(/[\uD800-\uDFFF]/g) || [])
            .length;
        return cursorPosition - emojiCount;
    };

    const isEmoji = (char: any) => {
        // You can implement a more comprehensive check for emojis
        // For simplicity, this example only checks for surrogate pairs
        return /[\uD800-\uDFFF]/.test(char);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _handleKeyDown = (e: any) => {
        if (props.isInputDisabled) {
            if (message !== '') {
                setMessage('');
            }

            return;
        }

        if (e.key === 'Enter') {
            if (
                (props.isLink(message) || props.filterMessage(message)) &&
                !props.isLinkInCrocodileLabsLinksForInput(message)
            ) {
                props.setShowPopUp(true);
                props.setPopUpText('You cannot send this link.');
            } else {
                // send msg if ment panel is not active
                if (!mentPanelActive) {
                    handleSendMsg(e.target.value, roomId);
                    setMentUser(null);
                    setPossibleMentUser(null);
                    setMessage('');
                    dontShowEmojiPanel();
                    props.setShowPopUp(false);
                }
                // assign user for ment
                else {
                    setMentUser(possibleMentUser);

                    const reg = /@([^\s]*)/g;
                    const newMessage = message.replace(
                        reg,
                        '@' + getUserLabel(possibleMentUser) + ' ',
                    );
                    setMessage(newMessage);
                    setMentPanelActive(false);
                }
            }
        } else if (
            mentPanelActive &&
            (e.key === 'ArrowUp' || e.key === 'ArrowDown')
        ) {
            e.preventDefault();
            if (possibleMentUser === null) {
                setPossibleMentUser(
                    filteredUsers[
                        e.key === 'ArrowUp' ? filteredUsers.length - 1 : 0
                    ],
                );
            } else {
                const index = filteredUsers.indexOf(possibleMentUser);
                const targetIndex = e.key === 'ArrowUp' ? index - 1 : index + 1;
                setPossibleMentUser(
                    filteredUsers[
                        targetIndex < 0
                            ? filteredUsers.length - 1
                            : targetIndex == filteredUsers.length
                            ? 0
                            : targetIndex
                    ],
                );
            }
        } else if (
            e.key !== 'Backspace' &&
            e.key !== 'ArrowRight' &&
            e.key !== 'ArrowLeft' &&
            e.target.value.length >= 140
        ) {
            props.setShowPopUp(true);
            props.setShowPopUp(true);
            props.setPopUpText(
                'Maximum length exceeded (140 characters limit).',
            );
            e.preventDefault(); // Prevent further input when the limit is reached
        } else if (e.key === 'Delete') {
            setTimeout(() => {
                setInputLength(e.target.value.length);
            });
        } else if (e.key === 'ArrowRight') {
            if (cursorPosition !== null && cursorPosition < message.length) {
                setCursorPosition((prevCursorPosition) => {
                    let newPosition = prevCursorPosition ?? +1;

                    // Check if the next character is an emoji (multi-char)
                    while (
                        newPosition < message.length &&
                        isEmoji(message.charAt(newPosition))
                    ) {
                        newPosition++;
                    }

                    return newPosition <= message.length
                        ? newPosition
                        : message.length;
                });
            }
            setInputLength(e.target.value.length);
        } else if (e.key === 'ArrowLeft') {
            if (cursorPosition !== null && cursorPosition > 0) {
                setCursorPosition((prevCursorPosition) => {
                    let newPosition = prevCursorPosition ?? -1;

                    // Check if the previous character is an emoji (multi-char)
                    while (
                        newPosition >= 0 &&
                        isEmoji(message.charAt(newPosition))
                    ) {
                        newPosition--;
                    }

                    return newPosition >= 0 ? newPosition : 0;
                });
            }
            setInputLength(e.target.value.length);
        } else {
            setInputLength(e.target.value.length);
        }
    };

    function openEmojiPanel(e: KeyboardEvent) {
        if (e.code === 'KeyC' && e.altKey) {
            setShowEmojiPicker(true);
        }
    }

    function closeEmojiPanel(e: KeyboardEvent) {
        if (e.code === 'KeyQ' && e.altKey) {
            setShowEmojiPicker(false);
        }
    }

    function openInfo(e: KeyboardEvent) {
        if (e.code === 'KeyM' && e.ctrlKey) {
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
        // console.log(msg);
        // console.log(mentUser);
        if (msg !== '' && address) {
            if (
                (isRoomAdmins && props.replyMessageContent !== undefined) ||
                (props.replyMessageContent?.roomInfo !== 'Admins' &&
                    props.replyMessageContent?.roomInfo !== undefined)
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
                    mentUser ? userLabelForFilter(mentUser) : null,
                    mentUser ? mentUser.walletID : null,
                    props.replyMessageContent !== undefined
                        ? props.replyMessageContent?._id
                        : undefined,
                );
            } else {
                console.log(
                    'burada',
                    isRoomAdmins,
                    props.replyMessageContent,
                    props.replyMessageContent?.roomInfo,
                    roomId,
                );
                props.sendMsg(
                    props.currentUser,
                    message,
                    roomId,
                    props.ensName,
                    address,
                    mentUser ? userLabelForFilter(mentUser) : null,
                    mentUser ? mentUser.walletID : null,
                    props.replyMessageContent !== undefined
                        ? props.replyMessageContent?._id
                        : undefined,
                );
            }
            props.setIsReplyButtonPressed(false);
            props.setReplyMessageContent(undefined);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onChangeMessage = async (e: any) => {
        setMessage(e.target.value);
        props.setShowPopUp(false);
        // if (e.target.value.indexOf('@') !== -1 && possibleMentUser === null) {
        if (e.target.value.indexOf('@') !== -1) {
            if (possibleMentUser === null) {
                setMentPanelActive(true);
            }
            // setMentPanelQueryStr();
            const filteredUsers = filterUsers(e.target.value.split('@')[1]);
            setFilteredUsers(filteredUsers);
            if (filteredUsers.length < 1) {
                setPossibleMentUser(null);
                setMentPanelActive(false);
            }
        } else {
            if (mentPanelActive) setMentPanelActive(false);
            setPossibleMentUser(null);
        }
    };

    const mentionAutoComplete = (
        <MentionAutoComplete
            userList={filteredUsers}
            active={mentPanelActive}
            queryStr={mentPanelQueryStr}
            selectedUser={possibleMentUser}
        />
    );

    return (
        <>
            {props.isInputDisabled && (
                <div className={styles.disabled_text}>
                    Message limit per minute exceeded, please wait.{' '}
                    {props.sendMessageCooldown}s
                </div>
            )}
            {!props.isInputDisabled && (
                <div
                    className={
                        !isConnected
                            ? styles.input_box_not_allowed
                            : styles.input_box
                    }
                >
                    <PositionBox
                        message={message}
                        isInput={true}
                        isPosition={isPosition}
                        setIsPosition={setIsPosition}
                        walletExplorer={
                            props.ensName === undefined
                                ? address
                                : props.ensName
                        }
                    />
                    <div>
                        {props.isReplyButtonPressed ? (
                            <ReplyMessage
                                message={props.replyMessageContent?.message}
                                ensName={props.ensName}
                                setIsReplyButtonPressed={
                                    props.setIsReplyButtonPressed
                                }
                                isReplyButtonPressed={
                                    props.isReplyButtonPressed
                                }
                            />
                        ) : (
                            ''
                        )}
                    </div>

                    <div
                        className={
                            !isConnected
                                ? styles.input_not_allowed
                                : styles.input
                        }
                    >
                        <input
                            type='text'
                            id='box'
                            placeholder={messageInputText()}
                            disabled={!isConnected || props.isInputDisabled}
                            className={
                                !isConnected
                                    ? styles.input_text_not_allowed
                                    : styles.input_text
                            }
                            onKeyDown={_handleKeyDown}
                            onInput={handleInputChange}
                            value={message}
                            onChange={handleInputChange}
                            onClick={handleInputClick}
                            onDoubleClick={handleInputDoubleClick}
                            autoComplete={'off'}
                            tabIndex={-1}
                            autoFocus={props.appPage}
                            maxLength={140}
                            ref={inputRef}
                        />
                        {inputLength >= 100 && (
                            <div className={styles.message_input_field}>
                                <CircularProgressBar
                                    fillPercentage={inputLength / 1.4}
                                />
                            </div>
                        )}

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
                                        Alt + X - opens emoji panel when chat is
                                        open
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
            )}
        </>
    );
}
