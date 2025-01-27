import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Provider } from 'ethers';
import { TokenIF } from '../../types';
import { NetworkIF } from '../../types/NetworkIF';
import { GCGO_TESTNET_URL } from '../gcgo';
import testnetTokenList from '../testnet-token-list.json';
import { TopPool } from './TopPool';

const PUBLIC_RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';
const SECONDARY_PUBLIC_RPC_URL = 'https://1rpc.io/sepolia';

const RESTRICTED_RPC_URL =
    import.meta.env.VITE_SEPOLIA_RPC_URL !== undefined
        ? import.meta.env.VITE_SEPOLIA_RPC_URL
        : undefined;

const PRIMARY_RPC_URL = RESTRICTED_RPC_URL
    ? RESTRICTED_RPC_URL
    : PUBLIC_RPC_URL;

const FALLBACK_RPC_URL =
    PRIMARY_RPC_URL === PUBLIC_RPC_URL
        ? SECONDARY_PUBLIC_RPC_URL
        : PUBLIC_RPC_URL;

const chainIdHex = '0xaa36a7';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Sepolia',
    currency: 'ETH',
    rpcUrl: PUBLIC_RPC_URL,
    explorerUrl: 'https://sepolia.etherscan.io/',
};

export const sepoliaETH: TokenIF = testnetTokenList.tokens.find(
    (token) =>
        token.address === '0x0000000000000000000000000000000000000000' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const sepoliaUSDC: TokenIF = testnetTokenList.tokens.find(
    (token) =>
        token.address === '0x60bBA138A74C5e7326885De5090700626950d509' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const sepoliaWBTC: TokenIF = testnetTokenList.tokens.find(
    (token) =>
        token.address === '0xCA97CC9c1a1dfA54A252DaAFE9b5Cd1E16C81328' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const ethereumSepolia: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    GCGO_URL: GCGO_TESTNET_URL,
    evmRpcUrl: PRIMARY_RPC_URL,
    fallbackRpcUrl: FALLBACK_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [sepoliaETH, sepoliaUSDC],
    defaultPairFuta: [sepoliaETH, sepoliaWBTC],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: 'Sepolia',
    tokenPriceQueryAssetPlatform: undefined,
    vaultsEnabled: false,
    tempestApiNetworkName: '',
    topPools: [
        new TopPool(sepoliaETH, sepoliaUSDC, chainSpecFromSDK.poolIndex),
        new TopPool(sepoliaETH, sepoliaWBTC, chainSpecFromSDK.poolIndex),
        new TopPool(sepoliaUSDC, sepoliaWBTC, chainSpecFromSDK.poolIndex),
    ],
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
