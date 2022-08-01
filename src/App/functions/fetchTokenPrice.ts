import Moralis from 'moralis';
export const fetchTokenPrice = async (address: string, chain: string) => {
    // get ENS domain of an address
    const options = { address: address, chain: chain as '0x5' | '0x1' };

    try {
        if (address && chain) {
            const tokenPrice = await Moralis.Web3API.token.getTokenPrice(options);

            return tokenPrice;
        }
    } catch (error) {
        return null;
    }
};
