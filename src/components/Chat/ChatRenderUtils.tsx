import { Message } from './Model/MessageModel';

import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { User } from './Model/UserModel';

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

export const getAvatar = (
    walletID: string,
    avatarImage: string,
    size?: number,
) => {
    if (avatarImage && avatarImage.length > 0) {
        return (
            <img
                src={avatarImage}
                style={{
                    width: '25px',
                    height: '25px',
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

export const getAvatarForUser = (user?: User, size?: number) => {
    if (!user) {
        return <Jazzicon diameter={25} seed={jsNumberForAddress('')} />;
    }
    return getAvatar(user.walletID, user.avatarImage, size ? size : 25);
};
