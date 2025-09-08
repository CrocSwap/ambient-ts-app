import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Chain } from '@reown/appkit/networks';
import { Provider } from 'ethers';
import { findTokenByAddress } from '../../dataLayer/functions/findTokenByAddress';
import { TokenIF } from '../../types';
import { NetworkIF } from '../../types/NetworkIF';
import { GCGO_TESTNET_URL } from '../gcgo';
import { TopPool } from './TopPool';

const PUBLIC_RPC_URL = 'https://testnet-rpc.monad.xyz/';
const SECONDARY_PUBLIC_RPC_URL = 'https://monad-testnet.drpc.org/';

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

const chainSpecForAppKit: Chain = {
    id: Number(chainIdHex),
    rpcUrls: {
        default: {
            http: [PUBLIC_RPC_URL],
        },
    },
    name: 'Monad Testnet',
    nativeCurrency: {
        name: 'Testnet MON Token',
        symbol: 'MON',
        decimals: 18,
    },
    blockExplorers: {
        default: {
            name: 'Monad Testnet explorer',
            url: 'https://testnet.monadexplorer.com/',
        },
    },
    contracts: {
        multicall3: {
            address: '0xcA11bde05977b3631167028862bE2a173976CA11',
        },
    },
    testnet: true,
};

const defaultTokenEntries = [
    ['MON', '0x0000000000000000000000000000000000000000'],
    ['USDC', '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea'],
    ['WETH', '0xB5a30b0FDc5EA94A52fDc42e3E9760Cb8449Fb37'],
    ['USDT', '0x88b8E2161DEDC77EF4ab7585569D2415a1C1055D'],
    ['WBTC', '0xcf5a6076cfa32686c0Df13aBaDa2b40dec133F1d'],
    ['ETH', '0x836047a99e11F376522B447bffb6e3495Dd0637c'],
    ['WWETH', '0xA296f47E8Ff895Ed7A092b4a9498bb13C46ac768'],
    ['gigaETH', '0x8589a0dd9ecd77b7d70ff76147dce366bf31254e'],
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
    evmRpcUrls: [PRIMARY_RPC_URL, FALLBACK_RPC_URL],
    chainSpecForAppKit,
    defaultPair: [MONAD_TESTNET_TOKENS.MON, MONAD_TESTNET_TOKENS.USDC],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    isTestnet: chainSpecFromSDK.isTestNet,
    displayName: 'Monad Testnet',
    tokenPriceQueryAssetPlatform: 'monad',
    vaultsEnabled: false,
    tempestApiNetworkName: '',
    fastLaneProtectionEnabled: true,
    topPools: [
        new TopPool(
            MONAD_TESTNET_TOKENS.MON,
            MONAD_TESTNET_TOKENS.USDC,
            chainSpecFromSDK.poolIndex,
        ),
    ],
    blockExplorer: (
        chainSpecForAppKit.blockExplorers?.default.url || ''
    ).replace(/\/?$/, '/'),
    getGasPriceInGwei: async (provider?: Provider) => {
        if (!provider) return 0;
        return (
            bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
            1e-9
        );
    },
};
