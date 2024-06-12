// Allowed links
export const CROCODILE_LABS_LINKS = [
    'https://twitter.com/',
    'https://docs.ambient.finance/',
    'https://ambient.finance/',
    'https://x.com/',
    'https://us.ambient.finance/',
    'https://scrollscan.com/',
    'https://blastscan.io/',
    'https://etherscan.io/',
];

export const LS_USER_VERIFY_TOKEN = 'CHAT_user_verify';
export const LS_USER_NON_VERIFIED_MESSAGES = 'CHAT_non_verified_messages';

export const AVATAR_TYPES = {
    JAZZ: '_jazz_',
    BLOCKIE: '_blockie_',
};

export const AVATAR_TYPES_SET = new Set([
    AVATAR_TYPES.JAZZ,
    AVATAR_TYPES.BLOCKIE,
]);

export const ALLOW_MENTIONS = import.meta.env.VITE_CHAT_DISABLE_MENTIONS
    ? false
    : true;
export const ALLOW_REACTIONS = import.meta.env.VITE_CHAT_DISABLE_REACTIONS
    ? false
    : true;
export const ALLOW_REPLIES = import.meta.env.VITE_CHAT_DISABLE_REPLIES
    ? false
    : true;
export const ALLOW_AUTH = import.meta.env.VITE_CHAT_DISABLE_AUTH ? false : true;
