import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { goerli as wagmiChain } from 'wagmi/chains';
import {
    goerliETH,
    goerliUSDC,
    goerliWBTC,
    goerliDAI,
    goerliUSDT,
} from '../data/defaultTokens';
import { TopPool } from '../data/defaultTopPools';
import { NetworkIF } from '../interfaces/exports';

export const ethereumGoerli: NetworkIF = {
    chainId: '0x5',
    wagmiChain,
    shouldPollBlock: false,
    marketData: '0x1',
    tokens: {
        WETH: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
        USDC: '0xd87ba7a50b2e7e660f678a895e4b72e7cb4ccd9c',
    },
    defaultPair: [goerliETH, goerliUSDC],
    topPools: [
        new TopPool(goerliETH, goerliUSDC, lookupChain('0x5').poolIndex),
        new TopPool(goerliETH, goerliWBTC, lookupChain('0x5').poolIndex),
        new TopPool(goerliUSDC, goerliDAI, lookupChain('0x5').poolIndex),
        new TopPool(goerliUSDT, goerliUSDC, lookupChain('0x5').poolIndex),
    ],
    stableTokens: [
        '0xdc31Ee1784292379Fbb2964b3B9C4124D8F89C60', // DAI
        '0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C', // USDC
    ],
    getGasPriceInGwei: async () => {
        const response = await fetch(
            'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=KNJM7A9ST1Q1EESYXPPQITIP7I8EFSY456',
        );
        const gasPrice = (await response.json()).result.ProposeGasPrice;
        return gasPrice ? parseInt(gasPrice) : undefined;
    },
};
