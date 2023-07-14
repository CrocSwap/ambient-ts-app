export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// temporary! fixing USD accounting on subgraph - open issue if urgent
export const TOKEN_HIDE = [
    '0xd46ba6d942050d489dbd938a2c909a5d5039a161',
    '0x7dfb72a2aad08c937706f21421b15bfc34cba9ca',
    '0x12b32f10a499bf40db334efe04226cca00bf2d9b',
];
export const POOL_HIDE = [
    '0x86d257cdb7bc9c0df10e84c8709697f92770b335',
    '0xf8dbd52488978a79dfe6ffbd81a01fc5948bf9ee',
    '0x8fe8d9bb8eeba3ed688069c3d6b556c9ca258248',
    '0xa850478adaace4c08fc61de44d8cf3b64f359bec',
];

// allow a local environment variable to be defined in [app_repo]/.env.local to set a name for dev environment
// NOTE: we use 'main' for staging (testnet) and 'production' for mainnet app. All other names are treated as 'local'
export type AppEnvironment = 'local' | 'main' | 'production';
export const BRANCH_NAME =
    process.env.REACT_APP_BRANCH_NAME !== undefined
        ? process.env.REACT_APP_BRANCH_NAME.toLowerCase()
        : 'local';

export const APP_ENVIRONMENT: AppEnvironment =
    (BRANCH_NAME as AppEnvironment) || 'local';

export const IS_LOCAL_ENV = APP_ENVIRONMENT === 'local';

export const GRAPHCACHE_URL =
    process.env.REACT_APP_GRAPHCACHE_URL || 'https://ambindexer.net';

export const GRAPHCACHE_SMALL_URL =
    process.env.REACT_APP_GRAPHCACHE_SMALL_URL || 'https://ambindexer.net/gcgo';

// const CHAT_BACKEND = 'https://proven-exchange-chat.herokuapp.com';
const CHAT_BACKEND = 'http://localhost:5000';

export const GRAPHCACHE_WSS_URL =
    process.env.REACT_APP_GRAPHCACHE_WSS_URL ||
    GRAPHCACHE_URL.replace('http', 'ws');

export const CHAT_BACKEND_URL =
    process.env.REACT_APP_CHAT_URL || `${CHAT_BACKEND}`;

export const CHAT_BACKEND_WSS_URL =
    process.env.REACT_APP_CHAT_WSS_URL ||
    CHAT_BACKEND_URL.replace('http', 'ws');

export const CHAT_ENABLED =
    process.env.REACT_APP_CHAT_IS_ENABLED !== undefined
        ? process.env.REACT_APP_CHAT_IS_ENABLED.toLowerCase() === 'true'
        : true;

export const MORALIS_KEY =
    process.env.REACT_APP_MORALIS_KEY ||
    'tb9SfJn2zwjLldR7JeHzLkT0cAHOu9Jc2QWVY06Sloar9VWNKTqZFMIta5BCWLma';

export const SHOULD_CANDLE_SUBSCRIPTIONS_RECONNECT = true;
export const SHOULD_NON_CANDLE_SUBSCRIPTIONS_RECONNECT = true;

// External links
export const DOCS_LINK = 'https://docs.ambient.finance/';
export const GITHUB_LINK = 'https://github.com/CrocSwap';
export const TWITTER_LINK = 'https://twitter.com/crocswap';
export const DISCORD_LINK = 'https://discord.com/invite/crocswap';
export const MEDIUM_LINK = 'https://crocswap.medium.com/';

export const OVERRIDE_CANDLE_POOL_ID = 36000;

// Localstorage keys
export const LS_KEY_CHART_SETTINGS = 'chart_settings';
export const LS_KEY_SUBCHART_SETTINGS = 'subchart_settings';

// Icon archive
export const ETH_ICON_URL =
    'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png';
