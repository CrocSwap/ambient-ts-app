import { CrocEnv } from '@crocswap-libs/sdk';
import { Provider } from '@ethersproject/providers';

export const querySpotPrice = async (
    baseTokenAddress: string,
    quoteTokenAddress: string,
    provider: Provider,
) => {
    console.log('Query spot price ' + baseTokenAddress + ' ' + quoteTokenAddress);
    const env = new CrocEnv(provider);
    console.log(
        'Query spot price ' + (await env.pool(baseTokenAddress, quoteTokenAddress).spotPrice()),
    );

    return env.pool(baseTokenAddress, quoteTokenAddress).spotPrice();
};
