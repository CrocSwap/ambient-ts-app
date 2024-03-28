export interface LikeDislikePayload {
    userId: string | undefined;
    actionType: number;
}

export interface MentFoundParam {
    val: boolean;
}
