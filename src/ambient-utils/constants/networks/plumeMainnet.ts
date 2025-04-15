import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Chain } from '@reown/appkit/networks';
import { Provider } from 'ethers';
import { findTokenByAddress } from '../../dataLayer/functions/findTokenByAddress';
import { TokenIF } from '../../types';
import { NetworkIF } from '../../types/NetworkIF';
import { GCGO_PLUME_URL } from '../gcgo';
import { TopPool } from './TopPool';

const RPC_URLS = {
    PUBLIC: 'https://phoenix-rpc.plumenetwork.xyz',
    SECONDARY_PUBLIC: 'https://phoenix-rpc.plumenetwork.xyz',
    RESTRICTED: import.meta.env.VITE_PLUME_RPC_URL,
    WEBSOCKET: 'wss://phoenix-rpc.plumenetwork.xyz',
};

const PRIMARY_RPC_URL = RPC_URLS.RESTRICTED || RPC_URLS.PUBLIC;
const FALLBACK_RPC_URL =
    PRIMARY_RPC_URL === RPC_URLS.PUBLIC ? RPC_URLS.PUBLIC : RPC_URLS.RESTRICTED;

const chainIdHex = '0x18232';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForAppKit: Chain = {
    id: Number(chainIdHex),
    rpcUrls: {
        default: {
            http: [RPC_URLS.PUBLIC],
            webSocket: [RPC_URLS.WEBSOCKET],
        },
    },
    name: 'Plume',
    nativeCurrency: {
        name: 'Plume',
        symbol: 'PLUME',
        decimals: 18,
    },
    blockExplorers: {
        default: {
            name: 'Blockscout',
            url: 'https://phoenix-explorer.plumenetwork.xyz',
            apiUrl: 'https://phoenix-explorer.plumenetwork.xyz/api',
        },
    },
};

const defaultTokenEntries = [
    ['PLUME', '0x0000000000000000000000000000000000000000'],
    ['pUSD', '0xdddD73F5Df1F0DC31373357beAC77545dC5A6f3F'],
    ['pETH', '0x39d1F90eF89C52dDA276194E9a832b484ee45574'],
    ['nRWA', '0x593cCcA4c4bf58b7526a4C164cEEf4003C6388db'],
    ['nTBILL', '0xE72Fe64840F4EF80E3Ec73a1c749491b5c938CB9'],
    ['nELIXIR', '0xD3BFd6E6187444170A1674c494E55171587b5641'],
    ['USDC.e', '0x78adD880A697070c1e765Ac44D65323a0DcCE913'],
    ['USDT', '0xda6087E69C51E7D31b6DBAD276a3c44703DFdCAd'],
    ['WETH', '0xca59cA09E5602fAe8B629DeE83FfA819741f14be'],
] as const;

type PlumeTokens = Record<(typeof defaultTokenEntries)[number][0], TokenIF>;

export const PLUME_TOKENS: PlumeTokens = Object.fromEntries(
    defaultTokenEntries.map(([key, address]) => [
        key,
        findTokenByAddress(address, chainIdHex),
    ]),
) as PlumeTokens;

const curentTopPoolsList: [keyof PlumeTokens, keyof PlumeTokens][] = [
    ['PLUME', 'pUSD'],
];

const topPools = curentTopPoolsList.map(
    ([tokenA, tokenB]) =>
        new TopPool(
            PLUME_TOKENS[tokenA],
            PLUME_TOKENS[tokenB],
            chainSpecFromSDK.poolIndex,
        ),
);

const getGasPriceInGwei = async (provider?: Provider) => {
    if (!provider) return 0;
    return (
        bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
        1e-9
    );
};

export const plumeMainnet: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    GCGO_URL: GCGO_PLUME_URL,
    evmRpcUrl: PRIMARY_RPC_URL,
    fallbackRpcUrl: FALLBACK_RPC_URL,
    chainSpecForAppKit,
    defaultPair: [PLUME_TOKENS.PLUME, PLUME_TOKENS.pUSD],
    defaultPairFuta: [PLUME_TOKENS.PLUME, PLUME_TOKENS.pUSD],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    isTestnet: chainSpecFromSDK.isTestNet,
    blockExplorer: (
        chainSpecForAppKit.blockExplorers?.default.url || ''
    ).replace(/\/?$/, '/'),
    displayName: 'Plume',
    tokenPriceQueryAssetPlatform: 'plume',
    vaultsEnabled: false,
    tempestApiNetworkName: '',
    topPools,
    getGasPriceInGwei,
};
