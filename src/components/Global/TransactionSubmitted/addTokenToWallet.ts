export default async function addTokenToWallet(
    address: string, // The address that the token is at.
    symbol: string, // A ticker symbol or shorthand, up to 5 chars.
    decimals: number, // The number of decimals in the token
    image: string,
) {
    const tokenAddress = address;
    const tokenSymbol = symbol;
    const tokenDecimals = decimals;
    const tokenImage = image;

    try {
        // wasAdded is a boolean. Like any RPC method, an error may be thrown.
        await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20', // Initially only supports ERC20, but eventually more!
                options: {
                    address: tokenAddress, // The address that the token is at.
                    symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
                    decimals: tokenDecimals, // The number of decimals in the token
                    image: tokenImage, // A string url of the token logo
                },
            },
        });
    } catch (error) {
        console.error(error);
    }
}
