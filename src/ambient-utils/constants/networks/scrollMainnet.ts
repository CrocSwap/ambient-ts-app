import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Provider } from 'ethers';
import { TokenIF } from '../../types';
import { NetworkIF } from '../../types/NetworkIF';
import ambientTokenList from '../ambient-token-list.json';
import { GCGO_SCROLL_URL } from '../gcgo';
import { TopPool } from './TopPool';

const PUBLIC_RPC_URL = 'https://scroll-rpc.publicnode.com';
const SECONDARY_PUBLIC_RPC_URL = 'https://rpc.scroll.io';

const RESTRICTED_RPC_URL =
    import.meta.env.VITE_SCROLL_RPC_URL !== undefined
        ? import.meta.env.VITE_SCROLL_RPC_URL
        : undefined;

const PRIMARY_RPC_URL = RESTRICTED_RPC_URL
    ? RESTRICTED_RPC_URL
    : PUBLIC_RPC_URL;

const FALLBACK_RPC_URL =
    PRIMARY_RPC_URL === PUBLIC_RPC_URL
        ? SECONDARY_PUBLIC_RPC_URL
        : PUBLIC_RPC_URL;

const chainIdHex = '0x82750';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Scroll',
    currency: 'ETH',
    rpcUrl: PUBLIC_RPC_URL,
    explorerUrl: 'https://scrollscan.com/',
};

export const scrollETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x0000000000000000000000000000000000000000' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const scrollUSDC: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const scrollUSDT: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const scrollWBTC: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x3C1BCa5a656e69edCD0D4E36BEbb3FcDAcA60Cf1' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const scrollWrsETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0xa25b25548b4c98b0c7d3d27dca5d5ca743d68b7f' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const scrollDAI: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0xcA77eB3fEFe3725Dc33bccB54eDEFc3D9f764f97' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const scrollAxlUSDC: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0xEB466342C4d449BC9f53A865D5Cb90586f405215' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const scrollUSDE: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const scrollSUSDe: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const scrollWstETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0xf610A9dfB7C89644979b4A0f27063E9e7d7Cda32' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const scrollRsETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x65421ba909200b81640d98b979d07487c9781b66' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const scrollRswETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x89f17aB70cAFB1468D633056161573efEfeA0713' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const scrollSTONE: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x80137510979822322193FC997d400D5A6C747bf7' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const scrollUniETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x15eefe5b297136b8712291b632404b66a8ef4d25' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const scrollWeETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x01f0a31698c4d065659b9bdc21b3610292a1c506' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const scrollPxETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x9e0d7d79735e1c63333128149c7b616a0dc0bbdb' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const scrollPufETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0xc4d46E8402F476F269c379677C99F18E22Ea030e' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const scrollRocketPoolETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x53878B874283351D26d206FA512aEcE1Bef6C0dD' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const scrollSOLVBTC: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x3Ba89d490AB1C0c9CC2313385b30710e838370a4' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const scrollMainnet: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    GCGO_URL: GCGO_SCROLL_URL,
    evmRpcUrl: PRIMARY_RPC_URL,
    fallbackRpcUrl: FALLBACK_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [scrollETH, scrollUSDC],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: 'Scroll',
    tokenPriceQueryAssetPlatform: 'scroll',
    vaultsEnabled: true,
    tempestApiNetworkName: 'scroll',
    topPools: [
        new TopPool(scrollETH, scrollUSDC, chainSpecFromSDK.poolIndex),
        new TopPool(scrollUSDT, scrollUSDC, chainSpecFromSDK.poolIndex),
        new TopPool(scrollETH, scrollUSDT, chainSpecFromSDK.poolIndex),
        new TopPool(scrollETH, scrollWBTC, chainSpecFromSDK.poolIndex),
        new TopPool(scrollWrsETH, scrollETH, chainSpecFromSDK.poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
