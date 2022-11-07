/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMoralis } from 'react-moralis';
import useSocket, {
    receiveUsername,
    // host,
    sendMessageRoute,
} from '../../Service/useSocket';
import axios from 'axios';
import { BsSlashSquare, BsEmojiSmileFill } from 'react-icons/bs';
import { Message } from '../../Model/MessageModel';
import Picker from 'emoji-picker-react';
import styles from './MessageInput.module.css';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { ITransaction } from '../../../../utils/state/graphDataSlice';
import PositionBox from '../PositionBox/PositionBox';
import { PoolIF } from '../../../../utils/interfaces/PoolIF';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { targetData } from '../../../../utils/state/tradeDataSlice';
import useChatApi from '../../Service/ChatApi';

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
    const { favePools, currentPool } = prop;
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const { user, account, enableWeb3, isWeb3Enabled, isAuthenticated } = useMoralis();
    const [currentUser, setCurrentUser] = useState('');
    const [isPosition, setIsPosition] = useState(false);
    // const { roomId } = props.match.params;

    const { messages, getMsg, sendMsg } = useSocket(props.room);
    const { getID } = useChatApi();

    const roomId =
        props.room === 'Current Pool'
            ? prop.currentPool.baseToken.symbol + prop.currentPool.quoteToken.symbol
            : props.room;

    const handleEmojiClick = (event: any, emoji: any) => {
        let msg = message;
        msg += emoji.emoji;
        setMessage(msg);
    };

    const handleEmojiPickerHideShow = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const dontShowEmojiPanel = () => {
        setShowEmojiPicker(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _handleKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            handleSendMsg(e.target.value, roomId);
            setMessage('');
            dontShowEmojiPanel();
        }
    };

    const handleSendMsg = async (msg: string, roomId: any) => {
        console.log('Current user is ', currentUser);
        sendMsg(props.currentUser, message, roomId, props.ensName, account);
    };

    const onChangeMessage = async (e: any) => {
        setMessage(e.target.value);
    };

    const onChangeMessageWithMention = async (e: any) => {
        const value = e.target.value;
        if (value.includes('@')) {
            let response;
            const myArray = value.split('@');
            const word = myArray[1];
            if (word.length > 0) {
                response = await axios
                    .get(receiveUsername + '/' + word)
                    .then((response) => {
                        console.log({ response });
                        setMessage(value);
                    })
                    .catch((exception) => {
                        console.log(exception);
                    });
            }
        }
    };

    return (
        <div className={styles.input_box}>
            <PositionBox
                message={message}
                isInput={true}
                isPosition={isPosition}
                setIsPosition={setIsPosition}
            />

            <div className={styles.input}>
                <input
                    type='text'
                    id='box'
                    placeholder={
                        isAuthenticated || isWeb3Enabled
                            ? 'Type to chat. Enter to submit.'
                            : 'Please log in to chat.'
                    }
                    disabled={!isAuthenticated || !isWeb3Enabled}
                    className={styles.input_text}
                    onKeyDown={_handleKeyDown}
                    value={message}
                    onChange={onChangeMessage}
                />

                <BsEmojiSmileFill onClick={handleEmojiPickerHideShow} />
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
