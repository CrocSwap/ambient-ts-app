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

        const result = response?.result;

        const userEthNFTs = result.filter((nft) => nft.contractType === 'ERC1155');

        console.log({ userEthNFTs });
        if (userEthNFTs) {
            // console.log({ userEthNFTs });
            const imageLocalURLs: string[] = [];
            userEthNFTs.forEach((nft) => {
                const metadata = nft.metadata;

                if (metadata) {
                    // const parsedMetadata = JSON.parse(metadata);
                    let imageGatewayURL;
                    const imageUrl = (metadata as unknown as metadata).image;
                    if (
                        imageUrl.includes('lotterynft') ||
                        [
                            '88279830972223375506659847640588682494880443313199730925423741164868176183297',
                        ].includes(nft.result.tokenId.toString())
                    ) {
                        return;
                    } else if (
                        !nft.symbol ||
                        ![
                            'RARI',
                            'Save Fud NFT Lab',
                            'ICE',
                            'OPENSTORE',
                            // 'ToshimonMinter',
                        ].includes(nft.symbol)
                    ) {
                        return;
                    } else if (imageUrl.startsWith('https://')) {
                        imageGatewayURL = imageUrl;
                    } else if (imageUrl.startsWith('ipfs://')) {
                        const imageUrlNoProtocol = imageUrl.substring(12);
                        // const imageGatewayURL =
                        //     'https://cloudflare-ipfs.com/ipfs/' + imageUrlNoProtocol;
                        imageGatewayURL = 'https://ipfs.io/ipfs/' + imageUrlNoProtocol;
                    }
                    console.log({ nftMatchingAllowList: nft });
                    // console.log({ imageGatewayURL });
                    if (imageGatewayURL)
                        fetch(imageGatewayURL)
                            .then((response) => response.blob())
                            .then((image) => {
                                if (image.type.includes('image')) {
                                    // Create a local URL of that image
                                    const localUrl = URL.createObjectURL(image);
                                    imageLocalURLs.push(localUrl);
                                }
                            })
                            .catch(console.log);
                }
            });
            // console.log({ imageLocalURLs });
            return imageLocalURLs;
        }
    } catch (e) {
        console.error(e);
    }
}
