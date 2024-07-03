export interface LikeDislikePayload {
    userId: string | undefined;
    actionType: number;
}

export interface MentFoundParam {
    val: boolean;
}

export interface ChatWsQueryParams {
    roomId: string;
    transport?: string;
    address?: string;
    ensName?: string | null | undefined;
}

export interface ChatWsDecodedMessage {
    msgType?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any;
}

export interface AvatarUpdateIF {
    userId: string;
    avatarImage: string;
}

export interface TopPoolDataIF {
    messageCount24h: number;
}

export interface GetTopRoomsResponseIF {
    roomInfo: string;
    data: TopPoolDataIF;
}

export interface ChatRoomIF {
    name: string;
    base?: string;
    quote?: string;
    popularity?: number;
    isFavourite?: boolean;
    shownName?: string;
}

export interface ChatGoToChatParamsIF {
    chain: string;
    tokenA: string;
    tokenB: string;
}

export interface UserAvatarDataIF {
    avatarImage: string;
    avatarThumbnail: string;
    avatarCompressed: string;
}
