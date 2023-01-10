/* eslint-disable @typescript-eslint/no-explicit-any */
import useSocket from '../../Service/useSocket';
import { Message } from '../../Model/MessageModel';

import { BsEmojiSmileFill } from 'react-icons/bs';
// import { Message } from '../../Model/MessageModel';
import Picker from 'emoji-picker-react';
import styles from './MessageInput.module.css';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import PositionBox from '../PositionBox/PositionBox';
import { PoolIF } from '../../../../utils/interfaces/PoolIF';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { targetData } from '../../../../utils/state/tradeDataSlice';

import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { useAccount } from 'wagmi';
interface MessageInputProps {
    message?: Message;
    room: string;
    currentUser: string;
    ensName: string;
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
    simpleRangeWidth: number;
    slippageTolerance: number;
    activeChartPeriod: number;
    targetData: targetData[];
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

export default function MessageInput(props: MessageInputProps, prop: ChatProps) {
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const { address, isConnected } = useAccount();
    const [isPosition, setIsPosition] = useState(false);
    // const { roomId } = props.match.params;

    const { sendMsg } = useSocket(props.room);

    const userData = useAppSelector((state) => state.userData);
    const isUserLoggedIn = userData.isLoggedIn;

    const roomId =
        props.room === 'Current Pool'
            ? prop.currentPool.baseToken.symbol + prop.currentPool.quoteToken.symbol
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
    const _handleKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            handleSendMsg(e.target.value, roomId);
            setMessage('');
            dontShowEmojiPanel();
        }
    };

    const handleSendMsg = async (msg: string, roomId: any) => {
        if (msg === '' || !address) {
            // do nothing
        } else {
            sendMsg(props.currentUser, message, roomId, props.ensName, address);
        }
    };

    const onChangeMessage = async (e: any) => {
        setMessage(e.target.value);
    };

    return (
        <div className={!isConnected ? styles.input_box_not_allowed : styles.input_box}>
            <PositionBox
                message={message}
                isInput={true}
                isPosition={isPosition}
                setIsPosition={setIsPosition}
            />

            <div className={!isConnected ? styles.input_not_allowed : styles.input}>
                <input
                    type='text'
                    id='box'
                    placeholder={messageInputText()}
                    disabled={!isConnected}
                    className={!isConnected ? styles.input_text_not_allowed : styles.input_text}
                    onKeyDown={_handleKeyDown}
                    value={message}
                    onChange={onChangeMessage}
                />

                <BsEmojiSmileFill
                    style={{ pointerEvents: !isUserLoggedIn ? 'none' : 'auto' }}
                    onClick={handleEmojiPickerHideShow}
                />
            </div>
            {showEmojiPicker && (
                <div className={styles.emojiPicker}>
                    <Picker
                        pickerStyle={{ width: '100%', height: '95%' }}
                        onEmojiClick={handleEmojiClick}
                    />
                </div>
            )}
        </div>
    );
}
