import {
    CROCODILE_LABS_LINKS,
    LS_USER_NON_VERIFIED_MESSAGES,
    LS_USER_VERIFY_TOKEN,
} from './ChatConstants/ChatConstants';
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
    const wordDomain = word
        .replace(/^https?:\/\/(www\.)?/, '')
        .split('/')[0]
        .toLowerCase(); // Normalize by removing scheme and 'www.', then get the domain part, ensure lowercase for comparison.

    return CROCODILE_LABS_LINKS.some((link: string) => {
        const linkUrl = new URL(link);
        const linkDomain = linkUrl.hostname.replace(/^www\./, '').toLowerCase(); // Remove 'www.' prefix if present and ensure lowercase.
        return linkDomain === wordDomain;
    });
};

export const isLinkInCrocodileLabsLinksForInput = (word: string) => {
    try {
        const normalizedWord = word.startsWith('http')
            ? word
            : `https://${word}`;
        const wordUrl = new URL(normalizedWord);
        const wordDomain = wordUrl.hostname.replace(/^www\./, '').toLowerCase(); // Normalize by removing 'www.' and ensure lowercase.

        return CROCODILE_LABS_LINKS.some((link) => {
            const linkUrl = new URL(link);
            const linkDomain = linkUrl.hostname
                .replace(/^www\./, '')
                .toLowerCase(); // Also remove 'www.' from the link domain.
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
