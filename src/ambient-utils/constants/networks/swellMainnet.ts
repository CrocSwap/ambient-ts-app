import { bigIntToFloat } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { Provider } from 'ethers';
import { TokenIF } from '../../types';
import { NetworkIF } from '../../types/NetworkIF';
import ambientTokenList from '../ambient-token-list.json';
import { GCGO_SWELL_URL } from '../gcgo';
import { TopPool } from './TopPool';

const RPC_URLS = {
    PUBLIC: 'https://swell-mainnet.alt.technology',
    SECONDARY_PUBLIC: 'https://rpc.ankr.com/swell',
    RESTRICTED: import.meta.env.VITE_SWELL_RPC_URL,
};
const PRIMARY_RPC_URL = RPC_URLS.RESTRICTED || RPC_URLS.PUBLIC;
const FALLBACK_RPC_URL =
    PRIMARY_RPC_URL === RPC_URLS.PUBLIC
        ? RPC_URLS.SECONDARY_PUBLIC
        : RPC_URLS.PUBLIC;

const chainIdHex = '0x783';
const chainSpecFromSDK = lookupChain(chainIdHex);

const chainSpecForWalletConnector = {
    chainId: Number(chainIdHex),
    name: 'Swellchain',
    currency: 'ETH',
    rpcUrl: RPC_URLS.PUBLIC,
    explorerUrl: 'https://explorer.swellnetwork.io/',
};

const findTokenByAddress = (address: string): TokenIF =>
    ambientTokenList.tokens.find(
        (token) =>
            token.address.toLowerCase() === address.toLowerCase() &&
            token.chainId === Number(chainIdHex),
    ) as TokenIF;

const defaultTokenEntries = [
    ['ETH', '0x0000000000000000000000000000000000000000'],
    ['USDE', '0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34'],
    ['ENA', '0x58538e6A46E07434d7E7375Bc268D3cb839C0133'],
    ['SWELL', '0x2826D136F5630adA89C1678b64A61620Aab77Aea'],
    ['weETH', '0xA6cB988942610f6731e664379D15fFcfBf282b44'],
    ['rswETH', '0x18d33689AE5d02649a859A1CF16c9f0563975258'],
    ['SUSDe', '0x211Cc4DD073734dA055fbF44a2b4667d5E5fE5d2'],
    ['wstETH', '0x7c98E0779EB5924b3ba8cE3B17648539ed5b0Ecc'],
    ['pzETH', '0x9cb41CD74D01ae4b4f640EC40f7A60cA1bCF83E7'],
    ['ezETH', '0x2416092f143378750bb29b79eD961ab195CcEea5'],
    ['rsETH', '0xc3eACf0612346366Db554C991D7858716db09f58'],
    ['swETH', '0x09341022ea237a4DB1644DE7CCf8FA0e489D85B7'],
    ['UBTC', '0xFA3198ecF05303a6d96E57a45E6c815055D255b1'],
    ['swBTC', '0x1cf7b5f266A0F39d6f9408B90340E3E71dF8BF7B'],
    ['stBTC', '0xf6718b2701D4a6498eF77D7c152b2137Ab28b8A3'],
] as const;

type SwellTokens = Record<(typeof defaultTokenEntries)[number][0], TokenIF>;

export const SWELL_TOKENS: SwellTokens = Object.fromEntries(
    defaultTokenEntries.map(([key, address]) => [
        key,
        findTokenByAddress(address),
    ]),
) as SwellTokens;

const curentTopPoolsList: [keyof SwellTokens, keyof SwellTokens][] = [
    ['ETH', 'USDE'],
    ['ETH', 'SWELL'],
    ['ENA', 'USDE'],
    ['weETH', 'rswETH'],
    ['weETH', 'rsETH'],
];

const topPools = curentTopPoolsList.map(
    ([tokenA, tokenB]) =>
        new TopPool(
            SWELL_TOKENS[tokenA],
            SWELL_TOKENS[tokenB],
            chainSpecFromSDK.poolIndex,
        ),
);

const getGasPriceInGwei = async (provider?: Provider) => {
    if (!provider) return 0;
    return (
        bigIntToFloat((await provider.getFeeData()).gasPrice || BigInt(0)) *
        1e-9
    );
};

export const swellMainnet: NetworkIF = {
    chainId: chainIdHex,
    chainSpec: chainSpecFromSDK,
    GCGO_URL: GCGO_SWELL_URL,
    evmRpcUrl: PRIMARY_RPC_URL,
    fallbackRpcUrl: FALLBACK_RPC_URL,
    chainSpecForWalletConnector: chainSpecForWalletConnector,
    defaultPair: [SWELL_TOKENS.ETH, SWELL_TOKENS.USDE],
    defaultPairFuta: [SWELL_TOKENS.ETH, SWELL_TOKENS.USDE],
    poolIndex: chainSpecFromSDK.poolIndex,
    gridSize: chainSpecFromSDK.gridSize,
    blockExplorer: chainSpecForWalletConnector.explorerUrl,
    displayName: 'Swell',
    tokenPriceQueryAssetPlatform: 'swell',
    vaultsEnabled: true,
    tempestApiNetworkName: 'swell',
    topPools,
    getGasPriceInGwei,
};
