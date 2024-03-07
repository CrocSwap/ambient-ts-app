import { Message } from './Model/MessageModel';
import { CROCODILE_LABS_LINKS } from '../../ambient-utils/constants';

export const LS_USER_VERIFY_TOKEN = 'CHAT_user_verify';
export const LS_USER_NON_VERIFIED_MESSAGES = 'CHAT_non_verified_messages';
export const LS_LAST_FOCUSED_MSG = 'CHAT_last_focused_msg';

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

export const isLink = (url: string) => {
    const urlPattern =
        /^(https?:\/\/)?((www\.)?([a-z0-9]+([-]{1}[a-z0-9]+)*\.[a-z]{2,7}))(\/.*)?$/i;
    return urlPattern.test(url);
};

const blockPattern = /\b\w+\.(?:com|org|net|co|io|edu|gov|mil|ac)\b.*$/;

export const filterMessage = (message: string) => {
    return blockPattern.test(message);
};

export const formatURL = (url: string) => {
    if (/^https?:\/\//i.test(url)) {
        url = url.replace(/^https?:\/\//i, '');
    }
    return url;
};

export const isValidUrl = (urlString: string) => {
    // Correct the format if it starts with "https:" followed directly by a domain name
    let formattedUrlString = urlString;
    if (
        formattedUrlString.startsWith('https:') &&
        !formattedUrlString.startsWith('https://')
    ) {
        formattedUrlString = formattedUrlString.replace('https:', 'https://');
    }

    // Check for obviously incorrect protocols or malformed URLs
    if (
        formattedUrlString.includes(':') &&
        !formattedUrlString.match(/^https?:\/\/.*/)
    ) {
        return false;
    }

    // Prepend 'https://' to strings that don't start with 'http://' or 'https://'
    // This is to handle cases like 'twitter.com' where the protocol is missing
    if (
        !formattedUrlString.startsWith('http://') &&
        !formattedUrlString.startsWith('https://')
    ) {
        formattedUrlString = `https://${formattedUrlString}`;
    }

    try {
        // Attempt to parse the URL

        // Further validation can be added here if necessary
        return true;
    } catch (e) {
        // Parsing failed, so it's not a valid URL
        return false;
    }
};

export const isLinkInCrocodileLabsLinks = (word: string) => {
    return CROCODILE_LABS_LINKS.some((link: string) => {
        const linkUrl = new URL(link);
        const linkDomain = linkUrl.hostname.replace(/^www\./, ''); // Remove 'www.' prefix if present
        const wordDomain = word
            .replace(/^https?:\/\/(www\.)?/, '')
            .split('/')[0]; // Remove scheme and 'www.', then get the domain part
        return linkDomain === wordDomain;
    });
};

export const isLinkInCrocodileLabsLinksForInput = (word: string) => {
    return CROCODILE_LABS_LINKS.some((link: string) => {
        try {
            const url = new URL(link);
            const domain = url.hostname;
            return word.toLowerCase().includes(domain);
        } catch (error) {
            console.error('Invalid URL:', link);
            return false;
        }
    });
};
