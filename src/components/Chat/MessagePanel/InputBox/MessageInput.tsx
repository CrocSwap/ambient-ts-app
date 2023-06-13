import { useAccount } from 'wagmi';
import { BsEmojiSmile } from 'react-icons/bs';
import { Message } from '../../Model/MessageModel';

import Picker from 'emoji-picker-react';
import styles from './MessageInput.module.css';
import { useContext, useEffect, useState } from 'react';
import PositionBox from '../PositionBox/PositionBox';

import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { RiCloseFill, RiInformationLine } from 'react-icons/ri';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import MentionAutoComplete from './MentionAutoComplete/MentionAutoComplete';
import { User, getUserLabel, userLabelForFilter } from '../../Model/UserModel';
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
    ) => void;
    inputListener?: (e: string) => void;
    users: User[];
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
    const [mentUser, setMentUser] = useState<User | null>(null);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

    const roomId = props.room;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEmojiClick = (event: any, emoji: any) => {
        let msg = message;
        msg += emoji.emoji;
        setMessage(msg);
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

    const handleSendMessageButton = () => {
        handleSendMsg(message, roomId);
        setMessage('');
        dontShowEmojiPanel();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _handleKeyDown = (e: any) => {
        console.log('..............................................');
        console.log(mentPanelActive);
        if (e.key === 'Enter') {
            // send msg if ment panel is not active
            if (!mentPanelActive) {
                handleSendMsg(e.target.value, roomId);
                setMessage('');
                dontShowEmojiPanel();
                setPossibleMentUser(null);
            }
            // assign user for ment
            else {
                console.log('assigning user for ment');
                setMentUser(possibleMentUser);

                const reg = /@([^\s]*)/g;
                const newMessage = message.replace(
                    reg,
                    '@' + getUserLabel(possibleMentUser) + ' ',
                );
                setMessage(newMessage);
                setMentPanelActive(false);
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
        }
        // else if(e.key === 'ArrowUp' && mentPanelActive) {
        //     e.preventDefault();
        //     if(possibleMentUser === null) {
        //         setPossibleMentUser(props.users[props.users.length - 1]);
        //     }else{
        //         const index = props.users.indexOf(possibleMentUser);
        //         if(index > 0) {

        //         }
        //     }

        // }else if(e.key === 'ArrowDown' && mentPanelActive) {
        //     e.preventDefault();
        // }
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
            props.sendMsg(
                props.currentUser,
                message,
                roomId,
                props.ensName,
                address,
            );
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onChangeMessage = async (e: any) => {
        setMessage(e.target.value);

        console.log(possibleMentUser);

        if (e.target.value.indexOf('@') !== -1 && possibleMentUser === null) {
            setMentPanelActive(true);
            // setMentPanelQueryStr();
            setFilteredUsers(filterUsers(e.target.value.split('@')[1]));
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
