import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Provider } from 'ethers';
import { TokenIF } from '../../types';
import { NetworkIF } from '../../types/NetworkIF';
import ambientTokenList from '../ambient-token-list.json';
import { GCGO_PLUME_URL } from '../gcgo';
import { TopPool } from './TopPool';

const RPC_URLS = {
    PUBLIC: 'https://phoenix-rpc.plumenetwork.xyz',
    RESTRICTED: import.meta.env.VITE_PLUME_RPC_URL,
};

const PRIMARY_RPC_URL = RPC_URLS.RESTRICTED || RPC_URLS.PUBLIC;
const FALLBACK_RPC_URL =
    PRIMARY_RPC_URL === RPC_URLS.PUBLIC ? RPC_URLS.PUBLIC : RPC_URLS.RESTRICTED;

const chainIdHex = '0x18231';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Plume Mainnet',
    currency: 'ETH',
    rpcUrl: RPC_URLS.PUBLIC,
    explorerUrl: 'https://phoenix-explorer.plumenetwork.xyz/',
};

const findTokenByAddress = (address: string): TokenIF =>
    ambientTokenList.tokens.find(
        (token) =>
            token.address.toLowerCase() === address.toLowerCase() &&
            token.chainId === Number(chainIdHex),
    ) as TokenIF;

const defaultTokenEntries = [
    ['ETH', '0x0000000000000000000000000000000000000000'],
    ['PETH', '0xD630fb6A07c9c723cf709d2DaA9B63325d0E0B73'],
    ['pUSD', '0xdddD73F5Df1F0DC31373357beAC77545dC5A6f3F'],
    ['USDC', '0x3938A812c54304fEffD266C7E2E70B48F9475aD6'],
    ['USDT', '0xA849026cDA282eeeBC3C39Afcbe87a69424F16B4'],
    ['NRWA', '0x81537d879ACc8a290a1846635a0cAA908f8ca3a6'],
    ['NTBILL', '0xE72Fe64840F4EF80E3Ec73a1c749491b5c938CB9'],
    ['NYIELD', '0x892DFf5257B39f7afB7803dd7C81E8ECDB6af3E8'],
] as const;

type PlumeTokens = {
    [Key in (typeof defaultTokenEntries)[number][0]]: TokenIF;
};

export const PLUME_TOKENS: PlumeTokens = Object.fromEntries(
    defaultTokenEntries.map(([key, address]) => [
        key,
        findTokenByAddress(address),
    ]),
) as PlumeTokens;

export const plumeMainnet: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    GCGO_URL: GCGO_PLUME_URL,
    evmRpcUrl: PRIMARY_RPC_URL,
    fallbackRpcUrl: FALLBACK_RPC_URL,
    chainSpecForWalletConnector,
    defaultPair: [PLUME_TOKENS.PETH, PLUME_TOKENS.pUSD],
    defaultPairFuta: [PLUME_TOKENS.PETH, PLUME_TOKENS.pUSD],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: 'Plume',
    tokenPriceQueryAssetPlatform: 'plume',
    vaultsEnabled: false,
    tempestApiNetworkName: '',
    topPools: [
        new TopPool(
            PLUME_TOKENS.ETH,
            PLUME_TOKENS.USDC,
            chainSpecFromSDK.poolIndex,
        ),
        new TopPool(
            PLUME_TOKENS.PETH,
            PLUME_TOKENS.USDC,
            chainSpecFromSDK.poolIndex,
        ),
        new TopPool(
            PLUME_TOKENS.PETH,
            PLUME_TOKENS.pUSD,
            chainSpecFromSDK.poolIndex,
        ),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
