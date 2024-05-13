import { TxPosition } from '../MessagePanel/InputBox/MessageInput';
export interface Message {
    _id: string;
    message: string;
    sender: string;
    createdAt: string;
    ensName: string;
    walletID: string;
    isMentionMessage: boolean;
    mentionedName: string;
    roomInfo: string;
    position: TxPosition;
}
