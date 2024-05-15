import { ethers } from 'ethers';

export default async function addTokenToWallet(
    address: string, // The address that the token is at.
    symbol: string, // A ticker symbol or shorthand, up to 5 chars.
    decimals: number, // The number of decimals in the token
    image: string,
    walletProvider: ethers.providers.ExternalProvider | undefined,
) {
    const tokenAddress = address;
    const tokenSymbol = symbol;
    const tokenDecimals = decimals;
    const tokenImage = image;

    try {
        if (walletProvider?.request) {
            await walletProvider.request({
                method: 'wallet_watchAsset',
                params: {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore - this is definitely the correct format but ethers wants an array of objects
                    type: 'ERC20', // Initially only supports ERC20, but eventually more!
                    options: {
                        address: tokenAddress, // The address that the token is at.
                        symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
                        decimals: tokenDecimals, // The number of decimals in the token
                        image: tokenImage, // A string url of the token logo
                    },
                },
            });
        }
    } catch (error) {
        console.error(error);
    }
}
