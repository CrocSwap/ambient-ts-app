import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Provider } from 'ethers';
import { findTokenByAddress } from '../../dataLayer/functions/findTokenByAddress';
import { TokenIF } from '../../types';
import { NetworkIF } from '../../types/NetworkIF';
import { GCGO_TESTNET_URL } from '../gcgo';
import { TopPool } from './TopPool';

const PUBLIC_RPC_URL = 'https://testnet-rpc.monad.xyz';
const SECONDARY_PUBLIC_RPC_URL =
    'https://proportionate-damp-dinghy.monad-testnet.quiknode.pro/aa00727df8eac0aa06add5d5d9595dd3ebb19b2f/';

const RESTRICTED_RPC_URL =
    import.meta.env.VITE_MONAD_TESTNET_RPC_URL !== undefined
        ? import.meta.env.VITE_MONAD_TESTNET_RPC_URL
        : undefined;

const PRIMARY_RPC_URL = RESTRICTED_RPC_URL
    ? RESTRICTED_RPC_URL
    : PUBLIC_RPC_URL;

const FALLBACK_RPC_URL =
    PRIMARY_RPC_URL === PUBLIC_RPC_URL && SECONDARY_PUBLIC_RPC_URL
        ? SECONDARY_PUBLIC_RPC_URL
        : PUBLIC_RPC_URL;

const chainIdHex = '0x279f';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Monad Testnet',
    currency: 'MON',
    // rpcUrl: 'https://testnet-rpc2.monad.xyz/52227f026fa8fac9e2014c58fbf5643369b3bfc6/',
    rpcUrl: 'https://testnet-rpc.monad.xyz/',
    explorerUrl: 'https://testnet.monadexplorer.com/',
};

const defaultTokenEntries = [
    ['MON', '0x0000000000000000000000000000000000000000'],
    ['USDC', '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea'],
    ['WETH', '0xB5a30b0FDc5EA94A52fDc42e3E9760Cb8449Fb37'],
    ['USDT', '0x88b8E2161DEDC77EF4ab7585569D2415a1C1055D'],
    ['WBTC', '0xcf5a6076cfa32686c0Df13aBaDa2b40dec133F1d'],
] as const;

// Infer the type of the keys and define the resulting type
type MonadTestnetTokens = {
    [Key in (typeof defaultTokenEntries)[number][0]]: TokenIF;
};

// Safely construct the object with type inference
export const MONAD_TESTNET_TOKENS: MonadTestnetTokens = Object.fromEntries(
    defaultTokenEntries.map(([key, address]) => [
        key,
        findTokenByAddress(address, chainIdHex),
    ]),
) as MonadTestnetTokens;

export const monadTestnet: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    GCGO_URL: GCGO_TESTNET_URL,
    evmRpcUrl: PRIMARY_RPC_URL,
    fallbackRpcUrl: FALLBACK_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [MONAD_TESTNET_TOKENS.MON, MONAD_TESTNET_TOKENS.USDC],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    displayName: 'Monad Testnet',
    tokenPriceQueryAssetPlatform: 'monad',
    vaultsEnabled: false,
    tempestApiNetworkName: '',
    topPools: [
        new TopPool(
            MONAD_TESTNET_TOKENS.MON,
            MONAD_TESTNET_TOKENS.USDC,
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
