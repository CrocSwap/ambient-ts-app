import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Provider } from 'ethers';
import { TokenIF } from '../../types';
import { NetworkIF } from '../../types/NetworkIF';
import ambientTokenList from '../ambient-token-list.json';
import { GCGO_PLUME_URL } from '../gcgo';
import { TopPool } from './TopPool';

const PUBLIC_RPC_URL = 'https://phoenix-rpc.plumenetwork.xyz';
const SECONDARY_PUBLIC_RPC_URL = 'https://phoenix-rpc.plumenetwork.xyz';

const RESTRICTED_RPC_URL =
    import.meta.env.VITE_PLUME_RPC_URL !== undefined
        ? import.meta.env.VITE_PLUME_RPC_URL
        : undefined;

const PRIMARY_RPC_URL = RESTRICTED_RPC_URL
    ? RESTRICTED_RPC_URL
    : PUBLIC_RPC_URL;

const FALLBACK_RPC_URL =
    PRIMARY_RPC_URL === PUBLIC_RPC_URL
        ? SECONDARY_PUBLIC_RPC_URL
        : PUBLIC_RPC_URL;

const chainIdHex = '0x18231';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Plume Mainnet',
    currency: 'ETH',
    rpcUrl: PUBLIC_RPC_URL,
    explorerUrl: 'https://phoenix-explorer.plumenetwork.xyz/',
};

export const plumeNativeETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x0000000000000000000000000000000000000000' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const plumePETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0xD630fb6A07c9c723cf709d2DaA9B63325d0E0B73' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const plumePUSD: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0xdddD73F5Df1F0DC31373357beAC77545dC5A6f3F' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const plumeUSDC: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x3938A812c54304fEffD266C7E2E70B48F9475aD6' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const plumeNRWA: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x81537d879ACc8a290a1846635a0cAA908f8ca3a6' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const plumeNTBILL: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0xE72Fe64840F4EF80E3Ec73a1c749491b5c938CB9' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const plumeNYIELD: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x892DFf5257B39f7afB7803dd7C81E8ECDB6af3E8' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const plumeMainnet: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    GCGO_URL: GCGO_PLUME_URL,
    evmRpcUrl: PRIMARY_RPC_URL,
    fallbackRpcUrl: FALLBACK_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [plumePETH, plumePUSD],
    defaultPairFuta: [plumePETH, plumePUSD],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: 'Plume',
    tokenPriceQueryAssetPlatform: 'plume',
    vaultsEnabled: false,
    tempestApiNetworkName: '',
    topPools: [
        new TopPool(plumeNativeETH, plumeUSDC, chainSpecFromSDK.poolIndex),
        new TopPool(plumePETH, plumeUSDC, chainSpecFromSDK.poolIndex),
        new TopPool(plumePETH, plumePUSD, chainSpecFromSDK.poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
