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

export interface TutorialStepExternalComponent {
    component: JSX.Element;
    placement?: 'nav-end' | 'nav-before' | 'nav-after';
}

// this interface inherited from Step interface which located in former intro.js dependency
export interface TutorialStepIF {
    element?: string | HTMLElement | Element;
    intro: string | React.ReactNode;
    position?: string;
    title?: string;
    tooltipClass?: string;
    highlightClass?: string;
    assignment?: string;
    actionTrigger?: string;
    actionOnComplete?: string;
    component?: JSX.Element;
    navigate?: { label: string; path: string };
}

export interface TutorialIF {
    lsKey: string;
    steps: TutorialStepIF[];
    showDefault?: boolean;
    externalComponents?: Map<string, TutorialStepExternalComponent>;
    noHelpModal?: boolean;
    helpModal?: {
        title?: string;
        content: JSX.Element;
    };
}

export interface PageDataCountIF {
    pair: string;
    counts: number[];
}
