import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';

interface metadata {
    name: string;
    description: string;
    image: string;
}

export async function getNFTs(account: string) {
    try {
        const address = account;

        const chain = EvmChain.ETHEREUM;

        const response = await Moralis.EvmApi.nft.getWalletNFTs({
            address,
            chain,
        });

        // console.log(response?.result);

        const userEthNFTs = response?.result.filter((nft) => nft.contractType === 'ERC1155');

        if (userEthNFTs) {
            // console.log({ userEthNFTs });
            const imageLocalURLs: string[] = [];
            userEthNFTs.forEach((nft) => {
                const metadata = nft.metadata;

                if (metadata) {
                    // const parsedMetadata = JSON.parse(metadata);
                    const imageIpfsUrl = (metadata as unknown as metadata).image;
                    const imageUrlNoProtocol = imageIpfsUrl.substring(12);
                    const imageGatewayURL =
                        'https://cloudflare-ipfs.com/ipfs/' + imageUrlNoProtocol;
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
            // console.log({ imageLocalURLs });
            return imageLocalURLs;
        }
    } catch (e) {
        console.error(e);
    }
}
