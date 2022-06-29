import Moralis from 'moralis';
export const fetchAddress = async (address: string) => {
    // get ENS domain of an address
    const options = { address: address };
    try {
        const ensName = (await Moralis.Web3API.resolve.resolveAddress(options)).name;
        console.log({ ensName });
        return ensName;
    } catch (error) {
        return null;
    }
};
