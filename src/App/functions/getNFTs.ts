import Moralis from 'moralis';

export async function getNFTs(account: string) {
    const userEthNFTs = (
        await Moralis.EvmApi.nft.getWalletNFTs({ address: account })
    ).result?.filter((nft) => nft.contractType === 'ERC1155');

    if (userEthNFTs) {
        // console.log({ userEthNFTs });
        const imageLocalURLs: string[] = [];
        userEthNFTs.forEach((nft) => {
            const metadata = nft.metadata;
            // console.log({ metadata });
            if (metadata) {
                const parsedMetadata = metadata;
                const imageURL = parsedMetadata.image;
                // const imageUrlNoProtocol =imageURL ? imageURL.substring(12) : undefined;
                const imageGatewayURL = 'https://cloudflare-ipfs.com/ipfs/' + imageURL;
                // const imageGatewayURL = 'https://ipfs.io/ipfs/' + imageUrlNoProtocol;
                // console.log({ imageGatewayURL });
                fetch(imageGatewayURL)
                    .then((response) => response.blob())
                    .then((image) => {
                        // Create a local URL of that image
                        const localUrl = URL.createObjectURL(image);
                        imageLocalURLs.push(localUrl);
                    });
            }
        });
        return imageLocalURLs;
    }
}
