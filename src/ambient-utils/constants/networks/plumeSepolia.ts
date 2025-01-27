import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Provider } from 'ethers';
import { TokenIF } from '../../types';
import { NetworkIF } from '../../types/NetworkIF';
import { GCGO_TESTNET_URL } from '../gcgo';
import testnetTokenList from '../testnet-token-list.json';
import { TopPool } from './TopPool';

const PUBLIC_RPC_URL = 'https://test-rpc.plumenetwork.xyz';
const SECONDARY_PUBLIC_RPC_URL = 'https://test-rpc.plumenetwork.xyz';

const RESTRICTED_RPC_URL =
    import.meta.env.VITE_PLUME_SEPOLIA_RPC_URL !== undefined
        ? import.meta.env.VITE_PLUME_SEPOLIA_RPC_URL
        : undefined;

const PRIMARY_RPC_URL = RESTRICTED_RPC_URL
    ? RESTRICTED_RPC_URL
    : PUBLIC_RPC_URL;

const FALLBACK_RPC_URL =
    PRIMARY_RPC_URL === PUBLIC_RPC_URL
        ? SECONDARY_PUBLIC_RPC_URL
        : PUBLIC_RPC_URL;

const chainIdHex = '0x18230';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Plume Devnet',
    currency: 'ETH',
    rpcUrl: PUBLIC_RPC_URL,
    explorerUrl: 'https://test-explorer.plumenetwork.xyz/',
};

export const plumeSepoliaETH: TokenIF = testnetTokenList.tokens.find(
    (token) =>
        token.address === '0x0000000000000000000000000000000000000000' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const plumeSepoliaUSD: TokenIF = testnetTokenList.tokens.find(
    (token) =>
        token.address === '0xe644F07B1316f28a7F134998e021eA9f7135F351' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const plumeSepoliaNEV: TokenIF = testnetTokenList.tokens.find(
    (token) =>
        token.address === '0x659619AEdf381c3739B0375082C2d61eC1fD8835' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const plumeSepolia: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    GCGO_URL: GCGO_TESTNET_URL,
    evmRpcUrl: PRIMARY_RPC_URL,
    fallbackRpcUrl: FALLBACK_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [plumeSepoliaETH, plumeSepoliaUSD],
    defaultPairFuta: [plumeSepoliaETH, plumeSepoliaUSD],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: 'Plume Devnet',
    tokenPriceQueryAssetPlatform: undefined,
    vaultsEnabled: false,
    tempestApiNetworkName: '',
    topPools: [
        new TopPool(
            plumeSepoliaETH,
            plumeSepoliaUSD,
            chainSpecFromSDK.poolIndex,
        ),
        new TopPool(
            plumeSepoliaUSD,
            plumeSepoliaNEV,
            chainSpecFromSDK.poolIndex,
        ),
        new TopPool(
            plumeSepoliaETH,
            plumeSepoliaNEV,
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
