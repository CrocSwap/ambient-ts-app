import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Provider } from 'ethers';
import { TokenIF } from '../../types';
import { NetworkIF } from '../../types/NetworkIF';
import { GCGO_TESTNET_URL } from '../gcgo';
import testnetTokenList from '../testnet-token-list.json';
import { TopPool } from './TopPool';

const PUBLIC_RPC_URL = 'https://sepolia.blast.io';
const SECONDARY_PUBLIC_RPC_URL = 'https://sepolia.blast.io';

const RESTRICTED_RPC_URL =
    import.meta.env.VITE_BLAST_SEPOLIA_RPC_URL !== undefined
        ? import.meta.env.VITE_BLAST_SEPOLIA_RPC_URL
        : undefined;

const PRIMARY_RPC_URL = RESTRICTED_RPC_URL
    ? RESTRICTED_RPC_URL
    : PUBLIC_RPC_URL;

const FALLBACK_RPC_URL =
    PRIMARY_RPC_URL === PUBLIC_RPC_URL
        ? SECONDARY_PUBLIC_RPC_URL
        : PUBLIC_RPC_URL;

const chainIdHex = '0xa0c71fd';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Blast Sepolia Testnet',
    currency: 'ETH',
    rpcUrl: 'https://sepolia.blast.io/',
    explorerUrl: 'https://testnet.blastscan.io/',
};

export const blastSepoliaETH: TokenIF = testnetTokenList.tokens.find(
    (token) =>
        token.address === '0x0000000000000000000000000000000000000000' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const blastSepoliaUSDB: TokenIF = testnetTokenList.tokens.find(
    (token) =>
        token.address === '0x4200000000000000000000000000000000000022' &&
        token.chainId === Number(chainIdHex),
) as TokenIF;

export const blastSepolia: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    GCGO_URL: GCGO_TESTNET_URL,
    evmRpcUrl: PRIMARY_RPC_URL,
    fallbackRpcUrl: FALLBACK_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [blastSepoliaETH, blastSepoliaUSDB],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    displayName: 'Blast Testnet',
    tokenPriceQueryAssetPlatform: undefined,
    vaultsEnabled: false,
    tempestApiNetworkName: '',
    topPools: [
        new TopPool(
            blastSepoliaETH,
            blastSepoliaUSDB,
            chainSpecFromSDK.poolIndex,
        ),
    ],
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
