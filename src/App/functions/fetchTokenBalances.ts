import Moralis from 'moralis';
export const fetchTokenBalances = async (
    address: string,
    chain: string,
    lastBlockNumber: number,
) => {
    // get ENS domain of an address
    const options = { address: address, chain: chain as '0x5' | '0x2a' };

    try {
        if (address && chain && lastBlockNumber) {
            const tokenBalances = await Moralis.Web3API.account.getTokenBalances(options);
            return tokenBalances;
        }
    } catch (error) {
        return null;
    } finally {
        console.groupEnd();
    }
};
