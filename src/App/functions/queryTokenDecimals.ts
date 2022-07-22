import { CrocEnv } from '@crocswap-libs/sdk';
import { Provider } from '@ethersproject/providers';

export const queryTokenDecimals = async (tokenAddress: string, provider: Provider) => {
    console.log('Query token decimals ' + tokenAddress);
    const env = new CrocEnv(provider);
    return env.token(tokenAddress).decimals;
};
