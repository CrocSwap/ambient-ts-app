import { useMoralis } from 'react-moralis';
import { contractAddresses, getTokenBalanceDisplay } from '@crocswap-libs/sdk';
import { Signer } from 'ethers';

export const connectWallet = async (provider: Signer) => {
    // console.log(useMoralis());
    // console.log(useChain());
    const { Moralis, chainId, isWeb3Enabled, account } = useMoralis();
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
            nativeEthBalance = await getTokenBalanceDisplay(
                contractAddresses.ZERO_ADDR,
                account,
                provider,
            );
            console.log({ nativeEthBalance });
            return nativeEthBalance;
        }
    }
};
