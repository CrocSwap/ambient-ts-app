export const LS_USER_VERIFY_TOKEN = 'CHAT_user_verify';
export const LS_USER_NON_VERIFIED_MESSAGES = 'CHAT_non_verified_messages';

export const getMessageWithRestEndpoint =
    '/chat/api/messages/getMsgWithoutWebSocket/';

export const getAllMessagesEndpoint = '/chat/api/messages/getall/';

export const getMessageWithRestWithPaginationEndpoint =
    '/chat/api/messages/getMsgWithoutWebSocket/';

export const updateLikesDislikesCountEndpoint =
    '/chat/api/messages/updateLikeDislike';

export const getMentionsWithRestEndpoint = '/chat/api/messages/getMentions/';

export const getUserListWithRestEndpoint = '/chat/api/auth/getUsersForMent';

export const getUserIsVerified = '/chat/api/auth/isUserVerified/';

export const verifyUserEndpoint = '/chat/api/auth/verifyUser';

export const updateVerifiedDateEndpoint = '/chat/api/auth/updateVerifyDate';

export const addReactionEndpoint = '/chat/api/messages/addReaction';

export const getUserDetailsEndpoint = '/chat/api/auth/getUserByWalletID';

export const updateUnverifiedMessagesEndpoint =
    '/chat/api/messages/updateUnverifiedMessages';

export const getLS = (key: string, personalize?: string) => {
    if (personalize) {
        return localStorage.getItem(`${key}_${personalize}`);
    }
    return localStorage.getItem(key);
};

export const setLS = (key: string, data: string, personalize?: string) => {
    if (personalize) {
        return localStorage.setItem(`${key}_${personalize}`, data);
    }

    return localStorage.setItem(`${key}`, data);
};

export const getUnverifiedMsgList = (address?: string) => {
    const str = getLS(LS_USER_NON_VERIFIED_MESSAGES, address);
    let ids = str ? str.split(',').map((e) => e.trim()) : [];
    ids = ids.filter((e) => e.length > 0);
    return ids;
};

export const setUnverifiedMsgList = (ids: string[], address?: string) => {
    const str = ids.join(',');
    return setLS(LS_USER_NON_VERIFIED_MESSAGES, str, address);
};

export const removeFromUnverifiedList = (id: string, address?: string) => {
    const unfMsgIds = getUnverifiedMsgList(address);
    const newUnfMsgIds = unfMsgIds.filter((e) => e !== id);
    setUnverifiedMsgList(newUnfMsgIds, address);
};

export const getUserVerifyToken = (address?: string) => {
    const userToken = getLS(LS_USER_VERIFY_TOKEN, address);
    return userToken;
};
