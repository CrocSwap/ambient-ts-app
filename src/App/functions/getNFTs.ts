import Moralis from 'moralis';

export async function getNFTs(account: string) {
    const userEthNFTs = (
        await Moralis.Web3API.account.getNFTs({ address: account })
    ).result?.filter((nft) => nft.contract_type === 'ERC1155');

    if (userEthNFTs) {
        console.log({ userEthNFTs });
        const imageLocalURLs: string[] = [];
        userEthNFTs.forEach((nft) => {
            const metadata = nft.metadata;
            // console.log({ metadata });
            if (metadata) {
                const parsedMetadata = JSON.parse(metadata);
                const imageURL = parsedMetadata.image;
                const imageUrlNoProtocol = imageURL.substring(12);
                const imageGatewayURL = 'https://cloudflare-ipfs.com/ipfs/' + imageUrlNoProtocol;
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
