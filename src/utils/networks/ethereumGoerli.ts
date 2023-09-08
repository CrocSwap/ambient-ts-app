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
        ETH: '0x0000000000000000000000000000000000000000',
        WETH: '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6',
        USDC: '0xd87ba7a50b2e7e660f678a895e4b72e7cb4ccd9c',
        USDT: '0x509ee0d083ddf8ac028f2a56731412edd63223b9',
        UNI: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
        DAI: '0xdc31ee1784292379fbb2964b3b9c4124d8f89c60',
        WBTC: '0xc04b0d3107736c32e19f1c62b2af67be61d63a05',
        PEPE: '0x630f8b9d8f517af8f5b8670e6a167b6c0240d583',
        FRAX: '0x92d43093959C7DDa89896418bCE9DE0B87879646',
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
