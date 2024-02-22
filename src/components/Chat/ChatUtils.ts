import { Message } from './Model/MessageModel';

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

export const saveuserWithAvatarEndpoint =
    '/chat/api/auth/saveUserWithAvatarImage';
export const updateUserWithAvatarImageEndpoint =
    '/chat/api/auth/updateUserWithAvatarImage';
export const getUserAvatarImageByAccountEndpoint =
    '/chat/api/auth/getUserAvatarImageByAccount';

export const getUserAvatarEndpoint = '/chat/api/auth/getUserAvatar';

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

export const hasEns = (message: Message) => {
    return !(
        message.ensName === '' ||
        message.ensName === 'defaultValue' ||
        message.ensName === null ||
        message.ensName === 'null' ||
        message.ensName === undefined ||
        message.ensName === 'undefined'
    );
};

export const getShownName = (message: Message) => {
    if (!hasEns(message)) {
        return message.walletID.slice(0, 6) + '...';
    } else {
        return message.ensName;
    }
};

export const formatMessageTime = (time: string) => {
    const date = new Date(time);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const _min = minutes.toString().padStart(2, '0');
    const strTime = hours + ':' + _min + ' ' + ampm;
    return strTime;
};
