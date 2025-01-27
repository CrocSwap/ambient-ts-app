import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Provider } from 'ethers';
import { TokenIF } from '../../types';
import { NetworkIF } from '../../types/NetworkIF';
import { GCGO_TESTNET_URL } from '../gcgo';
import testnetTokenList from '../testnet-token-list.json';
import { TopPool } from './TopPool';

const PUBLIC_RPC_URL = 'https://swell-testnet.alt.technology';
const SECONDARY_PUBLIC_RPC_URL = 'https://rpc.ankr.com/swell-testnet';

const RESTRICTED_RPC_URL =
    import.meta.env.VITE_SWELL_SEPOLIA_RPC_URL !== undefined
        ? import.meta.env.VITE_SWELL_SEPOLIA_RPC_URL
        : undefined;

const PRIMARY_RPC_URL = RESTRICTED_RPC_URL
    ? RESTRICTED_RPC_URL
    : PUBLIC_RPC_URL;

const FALLBACK_RPC_URL =
    PRIMARY_RPC_URL === PUBLIC_RPC_URL
        ? SECONDARY_PUBLIC_RPC_URL
        : PUBLIC_RPC_URL;

const chainIdHex = '0x784';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Swellchain Testnet',
    currency: 'ETH',
    rpcUrl: PUBLIC_RPC_URL,
    explorerUrl: 'https://swell-testnet-explorer.alt.technology/',
};

export const swellSepoliaETH: TokenIF = testnetTokenList.tokens.find(
    (token) =>
        token.address === '0x0000000000000000000000000000000000000000' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const swellSepoliaUSDC: TokenIF = testnetTokenList.tokens.find(
    (token) =>
        token.address === '0xfEfD8bCB0034A2B0E3CC22e2f5A59279FAe67128' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const swellSepoliaUSDT: TokenIF = testnetTokenList.tokens.find(
    (token) =>
        token.address === '0x60bBA138A74C5e7326885De5090700626950d509' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const swellSepolia: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    GCGO_URL: GCGO_TESTNET_URL,
    evmRpcUrl: PRIMARY_RPC_URL,
    fallbackRpcUrl: FALLBACK_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [swellSepoliaETH, swellSepoliaUSDC],
    defaultPairFuta: [swellSepoliaETH, swellSepoliaUSDC],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: 'Swell Testnet',
    tokenPriceQueryAssetPlatform: undefined,
    vaultsEnabled: false,
    tempestApiNetworkName: '',
    topPools: [
        new TopPool(
            swellSepoliaETH,
            swellSepoliaUSDC,
            chainSpecFromSDK.poolIndex,
        ),
        new TopPool(
            swellSepoliaETH,
            swellSepoliaUSDT,
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
