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
    ensName?: string;
}

export interface ChatWsDecodedMessage {
    msgType?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any;
}
