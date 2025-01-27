import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Provider } from 'ethers';
import { TokenIF } from '../../types';
import { NetworkIF } from '../../types/NetworkIF';
import ambientTokenList from '../ambient-token-list.json';
import { GCGO_SWELL_URL } from '../gcgo';
import { TopPool } from './TopPool';

const PUBLIC_RPC_URL = 'https://swell-mainnet.alt.technology';
const SECONDARY_PUBLIC_RPC_URL = 'https://rpc.ankr.com/swell';

const RESTRICTED_RPC_URL =
    import.meta.env.VITE_SWELL_RPC_URL !== undefined
        ? import.meta.env.VITE_SWELL_RPC_URL
        : undefined;

const PRIMARY_RPC_URL = RESTRICTED_RPC_URL
    ? RESTRICTED_RPC_URL
    : PUBLIC_RPC_URL;

const FALLBACK_RPC_URL =
    PRIMARY_RPC_URL === PUBLIC_RPC_URL
        ? SECONDARY_PUBLIC_RPC_URL
        : PUBLIC_RPC_URL;

const chainIdHex = '0x783';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Swellchain',
    currency: 'ETH',
    rpcUrl: PUBLIC_RPC_URL,
    explorerUrl: 'https://explorer.swellnetwork.io/',
};

export const swellETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x0000000000000000000000000000000000000000' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const swellUSDE: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const swellENA: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x58538e6A46E07434d7E7375Bc268D3cb839C0133' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const swellSWELL: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x2826D136F5630adA89C1678b64A61620Aab77Aea' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const swellWEETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0xA6cB988942610f6731e664379D15fFcfBf282b44' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const swellRSWETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x18d33689AE5d02649a859A1CF16c9f0563975258' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const swellSUSDe: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const swellWSTETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x7c98E0779EB5924b3ba8cE3B17648539ed5b0Ecc' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const swellPZETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x9cb41CD74D01ae4b4f640EC40f7A60cA1bCF83E7' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const swellEZETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x2416092f143378750bb29b79eD961ab195CcEea5' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const swellRSETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0xc3eACf0612346366Db554C991D7858716db09f58' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const swellSWETH: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x09341022ea237a4DB1644DE7CCf8FA0e489D85B7' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const swellUBTC: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0xFA3198ecF05303a6d96E57a45E6c815055D255b1' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const swellSWBTC: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0x1cf7b5f266A0F39d6f9408B90340E3E71dF8BF7B' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const swellSTBTC: TokenIF = ambientTokenList.tokens.find(
    (token) =>
        token.address === '0xf6718b2701D4a6498eF77D7c152b2137Ab28b8A3' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const swellMainnet: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    GCGO_URL: GCGO_SWELL_URL,
    evmRpcUrl: PRIMARY_RPC_URL,
    fallbackRpcUrl: FALLBACK_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [swellETH, swellUSDE],
    defaultPairFuta: [swellETH, swellUSDE],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: 'Swell',
    tokenPriceQueryAssetPlatform: 'swell',
    vaultsEnabled: true,
    tempestApiNetworkName: 'swell',
    topPools: [
        new TopPool(swellETH, swellUSDE, chainSpecFromSDK.poolIndex),
        new TopPool(swellENA, swellUSDE, chainSpecFromSDK.poolIndex),
        new TopPool(swellETH, swellSWELL, chainSpecFromSDK.poolIndex),
        new TopPool(swellWEETH, swellRSWETH, chainSpecFromSDK.poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
