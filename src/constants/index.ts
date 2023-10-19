export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// allow a local environment variable to be defined in [app_repo]/.env.local to set a name for dev environment
// NOTE: we use 'main' for staging (testnet) and 'production' for mainnet app. All other names are treated as 'local'
export type AppEnvironment = 'local' | 'testnet' | 'production';
export const BRANCH_NAME =
    process.env.REACT_APP_BRANCH_NAME !== undefined
        ? process.env.REACT_APP_BRANCH_NAME.toLowerCase()
        : 'local';

export const APP_ENVIRONMENT: AppEnvironment =
    (BRANCH_NAME as AppEnvironment) || 'local';

export const IS_LOCAL_ENV = APP_ENVIRONMENT === 'local';

export const ANALYTICS_URL =
    process.env.REACT_APP_ANALYTICS_URL ||
    'https://crocswap-analytics-tools-service-dfxb5x3tja-uc.a.run.app/run?';

export const GRAPHCACHE_URL =
    process.env.REACT_APP_GRAPHCACHE_URL || 'https://ambindexer.net';

export const GRAPHCACHE_SMALL_URL =
    process.env.REACT_APP_GRAPHCACHE_SMALL_URL || 'https://ambindexer.net/gcgo';

export const GRAPHCACHE_WSS_URL =
    process.env.REACT_APP_GRAPHCACHE_WSS_URL ||
    GRAPHCACHE_URL.replace('http', 'ws');

export const CHAT_BACKEND_URL =
    process.env.REACT_APP_CHAT_URL || `${GRAPHCACHE_URL}`;

export const CHAT_BACKEND_WSS_URL =
    process.env.REACT_APP_CHAT_WSS_URL ||
    CHAT_BACKEND_URL.replace('http', 'ws');

export const CHAT_ENABLED =
    process.env.REACT_APP_CHAT_IS_ENABLED !== undefined
        ? process.env.REACT_APP_CHAT_IS_ENABLED.toLowerCase() === 'true'
        : true;

export const DISABLE_INIT_SETTINGS =
    process.env.REACT_APP_DISABLE_INIT_SETTINGS !== undefined
        ? process.env.REACT_APP_DISABLE_INIT_SETTINGS.toLowerCase() === 'true'
        : false;

export const SHOULD_CANDLE_SUBSCRIPTIONS_RECONNECT = true;
export const SHOULD_NON_CANDLE_SUBSCRIPTIONS_RECONNECT = true;

// External links
export const DOCS_LINK = 'https://docs.ambient.finance/';
export const GITHUB_LINK = 'https://github.com/CrocSwap';
export const TWITTER_LINK = 'https://twitter.com/ambient_finance';
export const DISCORD_LINK = 'https://discord.gg/ambient-finance';
export const MEDIUM_LINK = 'https://crocswap.medium.com/';

export const OVERRIDE_CANDLE_POOL_ID = 36000;

// Localstorage keys
export const LS_KEY_CHART_SETTINGS = 'chart_settings';
export const LS_KEY_SUBCHART_SETTINGS = 'subchart_settings';

// Icon archive
export const ETH_ICON_URL =
    'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png';

// Modal IDS
export const GLOBAL_MODAL_PORTAL_ID = 'ambient_global_modal_portal';
export const GLOBAL_MODAL_COMPONENT_ID = 'Modal_Global';
