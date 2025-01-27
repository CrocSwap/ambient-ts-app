import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Provider } from 'ethers';
import { TokenIF } from '../../types';
import { NetworkIF } from '../../types/NetworkIF';
import { GCGO_TESTNET_URL } from '../gcgo';
import testnetTokenList from '../testnet-token-list.json';
import { TopPool } from './TopPool';

const PUBLIC_RPC_URL = 'https://sepolia.base.org';
const SECONDARY_PUBLIC_RPC_URL = 'https://base-sepolia-rpc.publicnode.com';

const RESTRICTED_RPC_URL =
    import.meta.env.VITE_BASE_SEPOLIA_RPC_URL !== undefined
        ? import.meta.env.VITE_BASE_SEPOLIA_RPC_URL
        : undefined;

const PRIMARY_RPC_URL = RESTRICTED_RPC_URL
    ? RESTRICTED_RPC_URL
    : PUBLIC_RPC_URL;

const FALLBACK_RPC_URL =
    PRIMARY_RPC_URL === PUBLIC_RPC_URL
        ? SECONDARY_PUBLIC_RPC_URL
        : PUBLIC_RPC_URL;

const chainIdHex = '0x14a34';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Base Testnet',
    currency: 'ETH',
    rpcUrl: PUBLIC_RPC_URL,
    explorerUrl: 'https://swell-testnet-explorer.alt.technology/',
};

export const baseSepoliaETH: TokenIF = testnetTokenList.tokens.find(
    (token) =>
        token.address === '0x0000000000000000000000000000000000000000' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const baseSepoliaUSDC: TokenIF = testnetTokenList.tokens.find(
    (token) =>
        token.address === '0x1B98743bB9297A60FF9e75EA2630A77bf72bc17c' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const baseSepoliaUSDT: TokenIF = testnetTokenList.tokens.find(
    (token) =>
        token.address === '0x868cFD46ad326354AD214bEA9f08fD8EfBfac3b9' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const baseSepolia: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    GCGO_URL: GCGO_TESTNET_URL,
    evmRpcUrl: PRIMARY_RPC_URL,
    fallbackRpcUrl: FALLBACK_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [baseSepoliaETH, baseSepoliaUSDC],
    defaultPairFuta: [baseSepoliaETH, baseSepoliaUSDC],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: chainSpecForWalletConnector.name,
    tokenPriceQueryAssetPlatform: undefined,
    vaultsEnabled: false,
    tempestApiNetworkName: '',
    topPools: [
        new TopPool(
            baseSepoliaETH,
            baseSepoliaUSDC,
            chainSpecFromSDK.poolIndex,
        ),
        new TopPool(
            baseSepoliaETH,
            baseSepoliaUSDT,
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
