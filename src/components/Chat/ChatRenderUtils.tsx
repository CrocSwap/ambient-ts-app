// import { ImageMarkerIF } from './ChatIFs';
import { formatMessageTime, getShownName } from './ChatUtils';
import { CROCODILE_LABS_LINKS } from './ChatConstants/ChatConstants';
import { Message } from './Model/MessageModel';

import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

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
