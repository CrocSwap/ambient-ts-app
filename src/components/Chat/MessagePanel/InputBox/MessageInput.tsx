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
import { PoolIF, TokenIF } from '../../../../utils/interfaces/exports';

import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { RiCloseFill, RiInformationLine } from 'react-icons/ri';
import { AppStateContext } from '../../../../contexts/AppStateContext';
interface MessageInputProps {
    message?: Message;
    room: string;
    currentUser: string;
    ensName: string;
    appPage?: boolean;
    sendMsg: (
        currentUser: string,
        msg: string,
        room: string,
        ensName: string,
        walletID: string | null,
    ) => void;
}
interface currentPoolInfo {
    tokenA: TokenIF;
    tokenB: TokenIF;
    baseToken: TokenIF;
    quoteToken: TokenIF;
    didUserFlipDenom: boolean;
    isDenomBase: boolean;
    advancedMode: boolean;
    isTokenAPrimary: boolean;
    primaryQuantity: string;
    isTokenAPrimaryRange: boolean;
    primaryQuantityRange: string;
    limitPrice: string;
    advancedLowTick: number;
    advancedHighTick: number;
    slippageTolerance: number;
    pinnedMaxPriceDisplayTruncated: number;
    pinnedMinPriceDisplayTruncated: number;
}

export interface ChatProps {
    chatStatus: boolean;
    onClose: () => void;
    favePools: PoolIF[];
    currentPool: currentPoolInfo;
    isFullScreen?: boolean;
    setChatStatus: Dispatch<SetStateAction<boolean>>;
}

export default function MessageInput(
    props: MessageInputProps,
    prop: ChatProps,
) {
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

    const roomId =
        props.room === 'Current Pool'
            ? prop.currentPool.baseToken.symbol.toUpperCase() +
              prop.currentPool.quoteToken.symbol.toUpperCase()
            : props.room;

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSendMessageButton = () => {
        handleSendMsg(message, roomId);
        setMessage('');
        dontShowEmojiPanel();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _handleKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            handleSendMsg(e.target.value, roomId);
            setMessage('');
            dontShowEmojiPanel();
        }
    };

    // eslint-disable-next-line
    function openEmojiPanel(e: any) {
        if (e.keyCode === 88 && e.altKey) {
            setShowEmojiPicker(true);
        }
    }

    // eslint-disable-next-line
    function closeEmojiPanel(e: any) {
        if (e.keyCode === 81 && e.altKey) {
            setShowEmojiPicker(false);
        }
    }

    // eslint-disable-next-line
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSendMsg = async (msg: string, roomId: any) => {
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
    };

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
        </div>
    );
}
