import { PoolIF } from '../../ambient-utils/types';
import {
    AVATAR_TYPES_SET,
    CROCODILE_LABS_LINKS,
    LS_USER_NON_VERIFIED_MESSAGES,
    LS_USER_VERIFY_TOKEN,
} from './ChatConstants/ChatConstants';
import {
    ChatRoomIF,
    ChatWsDecodedMessage,
    GetTopPoolsResponse,
} from './ChatIFs';
import { Message } from './Model/MessageModel';

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

const blockPattern = /\b\w+\.(?:com|org|net|co|io|edu|gov|mil|ac|finance)\b.*$/;

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
    let formattedUrlString = urlString.toLowerCase();
    if (
        formattedUrlString.startsWith('https:') &&
        !formattedUrlString.startsWith('https://')
    ) {
        formattedUrlString = formattedUrlString.replace('https:', 'https://');
    }
    if (
        formattedUrlString.includes(':') &&
        !formattedUrlString.match(/^https?:\/\/.*/)
    ) {
        return false;
    }
    if (
        !formattedUrlString.startsWith('http://') &&
        !formattedUrlString.startsWith('https://')
    ) {
        formattedUrlString = `https://${formattedUrlString}`;
    }

    try {
        return true;
    } catch (e) {
        return false;
    }
};

export function isLinkInCrocodileLabsLinks(input: string) {
    let hostname = input.toLowerCase();

    if (input.includes('://')) {
        try {
            const inputUrl = new URL(input);
            hostname = inputUrl.hostname;
        } catch (error) {
            return false;
        }
    }

    const hostnameParts = hostname.split(/[.,:?#]+/).filter(Boolean);

    for (const link of CROCODILE_LABS_LINKS) {
        const domain = new URL(link).hostname.toLowerCase();
        const domainParts = domain.split(/[.,:?#]+/).filter(Boolean);

        if (domainParts.every((part, index) => hostnameParts[index] === part)) {
            console.log('isLinkInCrocodileLabsLinks: ', input);
            return true;
        }
    }

    return false;
}

export const isLinkInCrocodileLabsLinksForInput = (word: string) => {
    try {
        const normalizedWord = word.startsWith('http')
            ? word
            : `https://${word}`;
        normalizedWord.toLowerCase();
        const wordUrl = new URL(normalizedWord);
        const wordDomain = wordUrl.hostname.replace(/^www\./, '').toLowerCase();

        return CROCODILE_LABS_LINKS.some((link) => {
            const linkUrl = new URL(link);
            const linkDomain = linkUrl.hostname
                .replace(/^www\./, '')
                .toLowerCase();
            console.log(
                'isLinkInCrocodileLabsLinksForInput: ',
                link,
                wordDomain === linkDomain,
            );
            return wordDomain === linkDomain;
        });
    } catch (error) {
        return false;
    }
};

export const isMessageIdStoredInLS = (address: string, messageId: string) => {
    const nonVrfMessages = getLS(LS_USER_NON_VERIFIED_MESSAGES, address);
    if (nonVrfMessages) {
        const messageIDs = nonVrfMessages.split(',');
        const parsedMessages: string[] = [];
        messageIDs.map((e) => {
            parsedMessages.push(e.trim());
        });

        if (parsedMessages.includes(messageId)) {
            return true;
        } else {
            return false;
        }
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const encodeSocketIOMessage = (msgType: string, payload: any) => {
    return `42["${msgType}",${JSON.stringify(payload)}]`;
};

export const decodeSocketIOMessage = (msg: string) => {
    const ret: ChatWsDecodedMessage = {};

    if (msg.length > 2 && msg.indexOf('42[') == 0) {
        msg = msg.substring(3);
        if (msg.length > 0) {
            const parsed = JSON.parse(msg);
            if (parsed.length > 1) {
                ret.msgType = parsed[0];
                ret.payload = parsed[1];
            }
        }
    }

    return ret;
};

export const getDefaultRooms = (isModerator: boolean) => {
    const ret: ChatRoomIF[] = [
        {
            name: 'Global',
            shownName: 'Global 🌍',
        },
    ];

    if (isModerator) {
        ret.push({
            name: 'Admins',
            shownName: 'Admins 👑',
        });
    }

    return ret;
};

export const createRoomIF = (
    resp: GetTopPoolsResponse,
    popularityScore?: number,
) => {
    let ret: ChatRoomIF;
    if (resp.roomInfo.indexOf('/') >= 0) {
        ret = {
            name: resp.roomInfo,
            base: resp.roomInfo.split('/')[0].trim(),
            quote: resp.roomInfo.split('/')[1].trim(),
            popularity: popularityScore,
        };
    } else {
        ret = {
            name: resp.roomInfo,
            popularity: popularityScore,
        };
    }

    try {
        if (popularityScore && popularityScore > 0) {
            let append = '';
            for (let i = 0; i < popularityScore; i++) {
                append += '🔥';
            }

            ret.shownName = `${ret.name} ${append}`;
        }
    } catch {
        console.error('Error creating roomIF');
    }

    return ret;
};

export const getRoomNameFromPool = (pool: PoolIF) => {
    return `${pool.base.symbol} / ${pool.quote.symbol}`;
};

export const getRoomObjFromBaseQuote = (
    base: string,
    quote: string,
): ChatRoomIF => {
    return {
        name: `${base} / ${quote}`,
        base: base,
        quote: quote,
    };
};

export const getRoomNameFromBaseQuote = (base: string, quote: string) => {
    return `${base} / ${quote}`;
};

export const isAutoGeneratedAvatar = (avatarImage?: string) => {
    return (
        avatarImage &&
        avatarImage.length > 0 &&
        AVATAR_TYPES_SET.has(avatarImage)
    );
};
