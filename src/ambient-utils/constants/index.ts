export * from './networks';
export * from './blacklist';
export * from './defaultTokens';
export * from './gcgo';
export * from './slippage';
export * from './tokenListURIs';
export * from './tokenUnicodeCharMap';
export * from './gasEstimates';
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
    'https://ambindexer.net/analytics/run?';

export const HISTORICAL_CANDLES_URL =
    process.env.REACT_APP_HISTORICAL_CANDLES_URL || 'https://ambindexer.net';

export const CHAT_BACKEND_URL =
    process.env.REACT_APP_CHAT_URL || `${HISTORICAL_CANDLES_URL}`;

export const CHAT_BACKEND_WSS_URL =
    process.env.REACT_APP_CHAT_WSS_URL ||
    CHAT_BACKEND_URL.replace('http', 'ws');

export const CHAT_ENABLED =
    process.env.REACT_APP_CHAT_IS_ENABLED !== undefined
        ? process.env.REACT_APP_CHAT_IS_ENABLED.toLowerCase() === 'true'
        : true;

export const BLAST_RPC_URL =
    process.env.REACT_APP_BLAST_RPC_URL !== undefined
        ? process.env.REACT_APP_BLAST_RPC_URL
        : 'https://rpc.blast.io/';

export const INCLUDE_CANTO_LINK =
    process.env.REACT_APP_INCLUDE_CANTO_LINK !== undefined
        ? process.env.REACT_APP_INCLUDE_CANTO_LINK.toLowerCase() === 'true'
        : false;

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
export const CORPORATE_LINK = 'https://www.crocswap.com/';

export const OVERRIDE_CANDLE_POOL_ID = 36000;

// Localstorage keys
export const LS_KEY_CHART_SETTINGS = 'chart_settings';
export const LS_KEY_SUBCHART_SETTINGS = 'subchart_settings';
export const LS_KEY_ORDER_HISTORY_SETTINGS = 'order_history_settings';

// Icon archive
export const ETH_ICON_URL =
    'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png';

// Modal IDS
export const GLOBAL_MODAL_PORTAL_ID = 'ambient_global_modal_portal';
export const GLOBAL_MODAL_COMPONENT_ID = 'Modal_Global';

// BatchRequestManager config
export const BATCH_ENS_CACHE_EXPIRY = process.env.BATCH_ENS_CACHE_EXPIRY
    ? parseFloat(process.env.BATCH_ENS_CACHE_EXPIRY)
    : 1 * 60 * 60 * 1000;

export const BATCH_SIZE = process.env.REACT_APP_BATCH_BATCH_SIZE
    ? parseFloat(process.env.REACT_APP_BATCH_BATCH_SIZE)
    : 50;

export const BATCH_SIZE_DELAY = process.env.REACT_APP_BATCH_SIZE_DELAY
    ? parseFloat(process.env.REACT_APP_BATCH_SIZE_DELAY)
    : 1000;

// Fetch with timeout config
export const REQUEST_TIMEOUT_DELAY = process.env.REACT_APP_REQUEST_TIMEOUT_DELAY
    ? parseFloat(process.env.REACT_APP_REQUEST_TIMEOUT_DELAY)
    : 3000;

export const NETWORK_ACCESS = process.env.NETWORK_ACCESS || 'disabled';
export const CACHE_UPDATE_FREQ_IN_MS = 60000; // 1 minute

export const DEFAULT_CTA_DISMISSAL_DURATION_MINUTES = process.env
    .REACT_APP_DEFAULT_CTA_DISMISSAL_DURATION_MINUTES
    ? parseFloat(process.env.REACT_APP_DEFAULT_CTA_DISMISSAL_DURATION_MINUTES)
    : undefined;
