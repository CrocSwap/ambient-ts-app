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
    import.meta.env.VITE_BRANCH_NAME !== undefined
        ? import.meta.env.VITE_BRANCH_NAME.toLowerCase()
        : 'local';

export const APP_ENVIRONMENT: AppEnvironment =
    (BRANCH_NAME as AppEnvironment) || 'local';

export const IS_LOCAL_ENV = APP_ENVIRONMENT === 'local';

export const ANALYTICS_URL =
    import.meta.env.VITE_ANALYTICS_URL ||
    'https://ambindexer.net/analytics/run?';

export const HISTORICAL_CANDLES_URL =
    import.meta.env.VITE_HISTORICAL_CANDLES_URL || 'https://ambindexer.net';

export const CHAT_BACKEND_URL =
    import.meta.env.VITE_CHAT_URL || `${HISTORICAL_CANDLES_URL}`;

export const CHAT_BACKEND_WSS_URL =
    import.meta.env.VITE_CHAT_WSS_URL || CHAT_BACKEND_URL.replace('http', 'ws');

export const CHAT_ENABLED =
    import.meta.env.VITE_CHAT_IS_ENABLED !== undefined
        ? import.meta.env.VITE_CHAT_IS_ENABLED.toLowerCase() === 'true'
        : true;

export const BLOCK_POLLING_RPC_URL =
    import.meta.env.VITE_BLOCK_POLLING_RPC_URL !== undefined
        ? import.meta.env.VITE_BLOCK_POLLING_RPC_URL
        : '';

export const BLAST_RPC_URL =
    import.meta.env.VITE_BLAST_RPC_URL !== undefined
        ? import.meta.env.VITE_BLAST_RPC_URL
        : 'https://rpc.blast.io/';

export const SCROLL_RPC_URL =
    import.meta.env.VITE_SCROLL_RPC_URL !== undefined
        ? import.meta.env.VITE_SCROLL_RPC_URL
        : 'https://rpc.scroll.io/';

export const INCLUDE_CANTO_LINK =
    import.meta.env.VITE_INCLUDE_CANTO_LINK !== undefined
        ? import.meta.env.VITE_INCLUDE_CANTO_LINK.toLowerCase() === 'true'
        : false;

export const DISABLE_INIT_SETTINGS =
    import.meta.env.VITE_DISABLE_INIT_SETTINGS !== undefined
        ? import.meta.env.VITE_DISABLE_INIT_SETTINGS.toLowerCase() === 'true'
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
export const BATCH_ENS_CACHE_EXPIRY = import.meta.env.BATCH_ENS_CACHE_EXPIRY
    ? parseFloat(import.meta.env.BATCH_ENS_CACHE_EXPIRY)
    : 1 * 60 * 60 * 1000;

export const BATCH_SIZE = import.meta.env.VITE_BATCH_BATCH_SIZE
    ? parseFloat(import.meta.env.VITE_BATCH_BATCH_SIZE)
    : 50;

export const BATCH_SIZE_DELAY = import.meta.env.VITE_BATCH_SIZE_DELAY
    ? parseFloat(import.meta.env.VITE_BATCH_SIZE_DELAY)
    : 1000;

// Fetch with timeout config
export const REQUEST_TIMEOUT_DELAY = import.meta.env.VITE_REQUEST_TIMEOUT_DELAY
    ? parseFloat(import.meta.env.VITE_REQUEST_TIMEOUT_DELAY)
    : 3000;

export const NETWORK_ACCESS = import.meta.env.NETWORK_ACCESS || 'disabled';
export const CACHE_UPDATE_FREQ_IN_MS = 60000; // 1 minute

export const DEFAULT_POPUP_CTA_DISMISSAL_DURATION_MINUTES = import.meta.env
    .VITE_DEFAULT_POPUP_CTA_DISMISSAL_DURATION_MINUTES
    ? parseFloat(
          import.meta.env.VITE_DEFAULT_POPUP_CTA_DISMISSAL_DURATION_MINUTES,
      )
    : undefined;

export const DEFAULT_BANNER_CTA_DISMISSAL_DURATION_MINUTES = import.meta.env
    .VITE_DEFAULT_BANNER_CTA_DISMISSAL_DURATION_MINUTES
    ? parseFloat(
          import.meta.env.VITE_DEFAULT_BANNER_CTA_DISMISSAL_DURATION_MINUTES,
      )
    : undefined;

export const WALLETCONNECT_PROJECT_ID = import.meta.env
    .VITE_WALLETCONNECT_PROJECT_ID
    ? import.meta.env.VITE_WALLETCONNECT_PROJECT_ID
    : undefined;
