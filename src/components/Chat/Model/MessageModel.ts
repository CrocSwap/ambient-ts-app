export interface Message {
    _id: string;
    message: string;
    sender: string;
    createdAt: string;
    ensName: string;
    walletID: string;
    isMentionMessage: boolean;
    mentionedName: string;
    mentionedWalletID: string;
    roomInfo: string;
    likes?: [];
    dislikes?: [];
}
