import { useMoralis } from 'react-moralis';
import { CrocEnv } from '@crocswap-libs/sdk';
import { Provider } from '@ethersproject/providers';

export const connectWallet = async (provider: Provider) => {
    const { Moralis, chainId, isWeb3Enabled, account } = useMoralis();
    async function getStuff() {
        let nativeEthBalance = null;
        if (isWeb3Enabled && account !== null) {
            // this conditional is important because it prevents a TS error
            // ... in assigning the value of the key 'chain' below
            if (!!chainId && chainId === '0x2a') {
                const tokens = await Moralis.Web3API.account.getTokenBalances({
                    chain: chainId,
                    address: account,
                });
                console.log({ tokens });
                nativeEthBalance = await new CrocEnv(provider).tokenEth().balanceDisplay(account);
                console.log({ nativeEthBalance });
                return nativeEthBalance;
            }
        }
    }
    const stuff = await getStuff();
    return stuff;
};
