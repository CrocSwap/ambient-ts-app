// import { ImageMarkerIF } from './ChatIFs';
import { formatMessageTime, getShownName } from './ChatUtils';
import { Message } from './Model/MessageModel';

import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

import { CROCODILE_LABS_LINKS } from '../../ambient-utils/constants';

export const getAvatarFromMessage = (message: Message) => {
    return (
        <Jazzicon
            diameter={25}
            seed={jsNumberForAddress(message.walletID.toLocaleLowerCase())}
        />
    );
};

export const getAvatarFromMessageWithSize = (
    message: Message,
    size: number,
) => {
    return (
        <Jazzicon
            diameter={size}
            seed={jsNumberForAddress(message.walletID.toLocaleLowerCase())}
        />
    );
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

// export const getMarkerFromMessage = (message: Message) => {
//     const icon = getAvatarFromMessage(message);
//     const ret: ImageMarkerIF = {
//         x: message.replyX || 0,
//         y: message.replyY || 0,
//         message: message.message,
//         icon,
//         tooltipContent: getMessageCard(message),
//         markerId: message._id,
//     };
//     return ret;
// };

export const getMessageCard = (message: Message) => {
    return (
        <div
            key={message._id + 'card'}
            style={{
                marginBottom: '.4rem 0',
                padding: '.4rem',
                overflow: 'hidden',
                background: '#171d27',
                borderRadius: '0.6rem',
                minWidth: '10rem',
                position: 'relative',
                border: '1px solid #7371fc85',
            }}
        >
            <div
                style={{
                    display: 'inline-block',
                }}
            >
                {getAvatarFromMessageWithSize(message, 16)}
            </div>
            <div
                style={{
                    display: 'inline-block',
                    marginLeft: '.5rem',
                    marginTop: '.1rem',
                    verticalAlign: 'top',
                    opacity: 0.5,
                }}
            >
                {getShownName(message)}
            </div>
            <div
                style={{
                    marginLeft: '1.5rem',
                    display: 'block',
                }}
            >
                {message.message}
            </div>
            <div
                style={{
                    position: 'absolute',
                    right: '1rem',
                    bottom: '.6rem',
                    fontSize: '.7rem',
                    opacity: 0.3,
                }}
            >
                {formatMessageTime(message.createdAt)}
            </div>
        </div>
    );
};
