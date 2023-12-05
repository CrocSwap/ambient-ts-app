import { CrocEnv } from '@crocswap-libs/sdk';
import { ethers } from 'ethers';
import { performSwap } from '../dataLayer/swap/performSwap';
import { goerliETH, goerliUSDC } from '../constants';

describe('perform swap on Goerli', () => {
    let crocEnv: CrocEnv;

    beforeAll(() => {
        const providerUrl =
            process.env.GOERLI_PROVIDER_URL ||
            'https://goerli.infura.io/v3/c2d502344b024adf84b313c663131ada';
        const walletPrivateKey =
            process.env.GOERLI_PRIVATE_KEY ||
            'f95fc54b0f7c16b5b81998b084c1d17e27b0252c6578cebcfdf02cd1ba50221a';

        const provider = new ethers.providers.JsonRpcProvider(providerUrl);
        const signer = new ethers.Wallet(walletPrivateKey, provider);

        crocEnv = new CrocEnv(provider, signer);
    });

    it('performs a swap transaction', async () => {
        const params = {
            crocEnv,
            qty: '12000',
            buyTokenAddress: goerliETH.address,
            sellTokenAddress: goerliUSDC.address,
            slippageTolerancePercentage: 1,
            isWithdrawFromDexChecked: false,
            isSaveAsDexSurplusChecked: false,
        };

        const tx = await performSwap(params);

        if (tx.hash) {
            console.log(tx.hash);
        }

        // check user balances

        expect(tx).toBeDefined();
        expect(tx.hash).toBeDefined();

        const receipt = await tx.wait();
        expect(receipt.status).toEqual(1);
    }, 30000);
});
