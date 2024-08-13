// import { ImageMarkerIF } from './ChatIFs';
import {
    formatMessageTime,
    getEmojiFromUnifiedCode,
    getShownName,
    isAutoGeneratedAvatar,
} from './ChatUtils';
import { Message } from './Model/MessageModel';
import { User } from './Model/UserModel';

import Blockies from 'react-blockies';
import { FiEdit3 } from 'react-icons/fi';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { AVATAR_TYPES } from './ChatConstants/ChatConstants';
import { UserAvatarDataIF } from './ChatIFs';
import styles from './ChatRenderUtils.module.css';
import { UserSummaryModel } from './Model/UserSummaryModel';
import { Emoji } from 'emoji-picker-react';

export const getAvatarFromMessage = (message: Message) => {
    return (
        <Jazzicon
            diameter={25}
            seed={jsNumberForAddress(message.walletID.toLowerCase())}
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
            seed={jsNumberForAddress(message.walletID.toLowerCase())}
        />
    );
};

export const getAvatarForType = (
    seed: string,
    type: string,
    diameter: number,
) => {
    const blockiesFactor = 7;

    switch (type) {
        case '_jazz_':
        default:
            return (
                <>
                    <Jazzicon
                        // remove locale
                        seed={jsNumberForAddress(seed.toLowerCase())}
                        diameter={diameter}
                    />
                </>
            );

        case '_blockie_':
            return (
                <>
                    <span
                        className={styles.blockie_wrapper}
                        style={{
                            width: diameter ? diameter + 'px' : '1rem',
                            height: diameter ? diameter + 'px' : '1rem',
                        }}
                    >
                        <Blockies
                            seed={seed.toLowerCase()}
                            size={blockiesFactor}
                            scale={diameter / blockiesFactor}
                        />
                    </span>
                </>
            );
    }
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
    if (
        avatarImage &&
        avatarImage.length > 0 &&
        !isAutoGeneratedAvatar(avatarImage)
    ) {
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
        return getAvatarForType(
            walletID,
            avatarImage ? avatarImage : AVATAR_TYPES.JAZZ,
            size ? size : 25,
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
                        <FiEdit3 size={22}></FiEdit3>
                    </div>
                </>
            )}

            {avatarImage &&
            avatarImage.length > 0 &&
            !isAutoGeneratedAvatar(avatarImage) ? (
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
                getAvatarForType(
                    walletID,
                    avatarImage ? avatarImage : AVATAR_TYPES.JAZZ,
                    size ? size : 65,
                )
            )}
        </span>
    );
};

export const getAvatarForChat = (
    walletID?: string,
    user?: User | UserSummaryModel,
    size?: number,
) => {
    if (!user) {
        return getAvatarForType(
            walletID ? walletID : '',
            AVATAR_TYPES.JAZZ,
            25,
        );
    }
    return getAvatar(
        user.walletID,
        user.avatarThumbnail != undefined && user.avatarThumbnail.length > 0
            ? user.avatarThumbnail
            : user.avatarImage,
        size ? size : 25,
        false,
    );
};

export const getAvatarComponent = (
    walletID: string,
    resp: UserAvatarDataIF,
    size = 50,
    showThumb = false,
    showCompressed = false,
) => {
    return getAvatar(
        walletID,
        showThumb
            ? resp.avatarThumbnail
            : showCompressed
              ? resp.avatarCompressed
              : resp.avatarImage,
        size,
        false,
    );
};

export const getSingleEmoji = (
    unified: string,
    clickHandler?: (emoji: string) => void,
    size?: number,
) => {
    return (
        <span
            onClick={() => {
                if (clickHandler) {
                    const emojiCharacter = getEmojiFromUnifiedCode(unified);
                    clickHandler(emojiCharacter);
                }
            }}
        >
            <Emoji unified={unified} size={size ? size : 25} />
        </span>
    );
};

export const getEmojiPack = (
    unifiedCodes: string[],
    clickHandler?: (emoji: string) => void,
    size?: number,
) => {
    return (
        <>
            <span className={styles.emoji_pack_wrapper}>
                {unifiedCodes.map((code) => {
                    return (
                        <span
                            key={`emojiPack-${code}`}
                            className={styles.emoji_pack_node}
                        >
                            {getSingleEmoji(code, clickHandler, size)}
                        </span>
                    );
                })}
            </span>
        </>
    );
};
