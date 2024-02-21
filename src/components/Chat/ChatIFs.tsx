export interface LikeDislikePayload {
    userId: string | undefined;
    actionType: number;
}

export interface MentFoundParam {
    val: boolean;
}

export interface AvatarUpdateIF {
    userId: string;
    avatarImage: string;
}
