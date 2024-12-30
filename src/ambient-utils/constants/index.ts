import { brand } from './networks';
export * from './blacklist';
export * from './defaultTokens';
export * from './gasEstimates';
export * from './gcgo';
export * from './networks';
export * from './slippage';
export * from './tokenListURIs';
export * from './tokenUnicodeCharMap';
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

export const PAIR_LOOKUP_URL =
    import.meta.env.VITE_PAIR_LOOKUP_URL ||
    'https://croc-smart.liquidity.tools/pair-lookup?';

export const VAULTS_API_URL =
    import.meta.env.VITE_VAULTS_API_URL ||
    'https://protocol-service-api.tempestfinance.xyz/api/v1';

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

export const L1_GAS_CALC_ENABLED =
    import.meta.env.VITE_L1_GAS_CALC_ENABLED !== undefined
        ? import.meta.env.VITE_L1_GAS_CALC_ENABLED.toLowerCase() === 'true'
        : false;

export const VIEW_ONLY =
    (import.meta.env.VITE_VIEW_ONLY !== undefined
        ? import.meta.env.VITE_VIEW_ONLY.toLowerCase() === 'true'
        : false) ||
    window.location.hostname.startsWith('us.') ||
    window.location.hostname.split('.')[0].endsWith('-us');

export const DISABLE_WORKAROUNDS =
    import.meta.env.VITE_DISABLE_WORKAROUNDS !== undefined
        ? import.meta.env.VITE_DISABLE_WORKAROUNDS.toLowerCase() === 'true'
        : false;

export const BLOCK_POLLING_RPC_URL =
    import.meta.env.VITE_BLOCK_POLLING_RPC_URL !== undefined
        ? import.meta.env.VITE_BLOCK_POLLING_RPC_URL
        : '';

export const ALCHEMY_API_KEY =
    import.meta.env.VITE_ALCHEMY_API_KEY !== undefined
        ? import.meta.env.VITE_ALCHEMY_API_KEY
        : '';

export const DISABLE_INIT_SETTINGS =
    import.meta.env.VITE_DISABLE_INIT_SETTINGS !== undefined
        ? import.meta.env.VITE_DISABLE_INIT_SETTINGS.toLowerCase() === 'true'
        : false;

export const SHOULD_CANDLE_SUBSCRIPTIONS_RECONNECT = true;
export const SHOULD_NON_CANDLE_SUBSCRIPTIONS_RECONNECT = true;

// External links
export const DOCS_LINK = 'https://docs.ambient.finance/';
export const GITHUB_LINK = 'https://github.com/CrocSwap';
export const TWITTER_LINK = 'https://x.com/ambient_finance';
export const DISCORD_LINK = 'https://discord.gg/ambient-finance';
export const MEDIUM_LINK = 'https://crocswap.medium.com/';
export const CORPORATE_LINK = 'https://www.crocswap.com/';
export const SMOLREFUEL_LINK =
    'https://smolrefuel.com/?partner=0x2c60Cf0b9C78Cb51de0F9d532fe92CEd6bD353f9'; // croclabs.eth

export const OVERRIDE_CANDLE_POOL_ID = 36000;

// Localstorage keys
export const LS_KEY_CHART_SETTINGS = 'chart_settings';
export const LS_KEY_SUBCHART_SETTINGS = 'subchart_settings';
export const LS_KEY_ORDER_HISTORY_SETTINGS = 'order_history_settings';
export const LS_KEY_CHAIN_ID = 'CHAIN_ID';
export const LS_KEY_HIDE_EMPTY_POSITIONS_ON_ACCOUNT =
    'hide_empty_positions_on_account';

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

// Refresh USD prices in 15 minute windows
export const PRICE_WINDOW_GRANULARITY = 15 * 60 * 1000;

export const DEFAULT_POPUP_CTA_DISMISSAL_DURATION_MINUTES =
    brand === 'futa'
        ? Infinity
        : import.meta.env.VITE_DEFAULT_POPUP_CTA_DISMISSAL_DURATION_MINUTES
          ? parseFloat(
                import.meta.env
                    .VITE_DEFAULT_POPUP_CTA_DISMISSAL_DURATION_MINUTES,
            )
          : undefined;

export const DEFAULT_BANNER_CTA_DISMISSAL_DURATION_MINUTES =
    brand === 'futa'
        ? Infinity
        : import.meta.env.VITE_DEFAULT_BANNER_CTA_DISMISSAL_DURATION_MINUTES
          ? parseFloat(
                import.meta.env
                    .VITE_DEFAULT_BANNER_CTA_DISMISSAL_DURATION_MINUTES,
            )
          : undefined;

export const WALLETCONNECT_PROJECT_ID = import.meta.env
    .VITE_WALLETCONNECT_PROJECT_ID
    ? import.meta.env.VITE_WALLETCONNECT_PROJECT_ID
    : '4698477998162ad97b05880f2c03a82c';

export const CROCODILE_LABS_LINKS = [
    'https://twitter.com/',
    'https://docs.ambient.finance/',
    'https://ambient.finance/',
];

export const LS_USER_VERIFY_TOKEN = 'CHAT_user_verify';
export const LS_USER_NON_VERIFIED_MESSAGES = 'CHAT_non_verified_messages';

export const CURRENT_AUCTION_VERSION = 1;

export const SHOW_TUTOS_DEFAULT =
    import.meta.env.VITE_SHOW_TUTOS_DEFAULT || false;
