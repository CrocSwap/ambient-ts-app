interface ReactionModel {
    [key: string]: string[];
}

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
    repliedMessage: string | undefined;
    likes?: [];
    dislikes?: [];
    isDeleted: boolean;
    deletedMessageText: string;
    reactions: ReactionModel;
    isVerified?: boolean;
    avatarImage: string;
    chainId?: string;
    isUnread?: boolean;
}
