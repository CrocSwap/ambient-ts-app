// import { ImageMarkerIF } from './ChatIFs';
import { formatMessageTime, getShownName } from './ChatUtils';
import { Message } from './Model/MessageModel';
import { User } from './Model/UserModel';

import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import styles from './ChatRenderUtils.module.css';
import { AiOutlineFileImage } from 'react-icons/ai';

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

export const getAvatar = (
    walletID: string,
    avatarImage?: string,
    size?: number,
    canEdit?: boolean,
) => {
    if (avatarImage && avatarImage.length > 0) {
        return (
            <img
                src={avatarImage}
                className={`${styles.nft_avatar} ${
                    canEdit ? styles.can_edit : ''
                }`}
                style={{
                    width: size ? size + 'px' : '25px',
                    height: size ? size + 'px' : '25px',
                    borderRadius: '50%',
                }}
            ></img>
        );
    } else {
        return (
            <Jazzicon
                diameter={size}
                seed={jsNumberForAddress(walletID.toLocaleLowerCase())}
            />
        );
    }
};

export const getAvatarForProfilePage = (
    walletID: string,
    avatarImage?: string | undefined,
    size?: number,
    canEdit?: boolean,
) => {
    return (
        <span className={styles.nft_avatar_wrapper}>
            {canEdit && (
                <>
                    <div className={styles.nft_edit_overlay}></div>
                    <div className={styles.nft_edit_icon}>
                        <AiOutlineFileImage size={24}></AiOutlineFileImage>
                    </div>
                </>
            )}

            {avatarImage && avatarImage.length > 0 ? (
                <img
                    src={avatarImage}
                    className={`${styles.nft_avatar} ${
                        canEdit ? styles.can_edit : ''
                    }`}
                    style={{
                        width: size ? size + 'px' : '25px',
                        height: size ? size + 'px' : '25px',
                        borderRadius: '50%',
                    }}
                ></img>
            ) : (
                <Jazzicon
                    diameter={size}
                    seed={jsNumberForAddress(walletID.toLocaleLowerCase())}
                />
            )}
        </span>
    );
};

export const getAvatarForChat = (user?: User, size?: number) => {
    if (!user) {
        return <Jazzicon diameter={25} seed={jsNumberForAddress('')} />;
    }
    return getAvatar(
        user.walletID,
        user.avatarThumbnail != undefined && user.avatarThumbnail.length > 0
            ? user.avatarThumbnail
            : user.avatarImage,
        size ? size : 25,
    );
};
