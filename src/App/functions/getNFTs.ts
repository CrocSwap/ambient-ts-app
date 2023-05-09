import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/common-evm-utils';
import { IS_LOCAL_ENV } from '../../constants';

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
            address: address,
            chain: chain,
            mediaItems: true,
        });

        const result = response?.result;

        const userEthNFTs = result.filter(
            (nft) => nft.contractType === 'ERC1155',
        );

        IS_LOCAL_ENV && console.debug({ userEthNFTs });
        if (userEthNFTs) {
            const imageLocalURLs: string[] = [];
            userEthNFTs.forEach((nft) => {
                const metadata = nft.metadata;
                const media = nft.media;
                console.log({ media });
                if (media) {
                    const mediaCollection = media.mediaCollection;
                    console.log({ mediaCollection });
                    const highPreview = mediaCollection?.high;
                    console.log({ highPreview });
                    const highPreviewUrl = highPreview?.url;
                    console.log({ highPreviewUrl });

                    // const originalImageUrl = (metadata as unknown as metadata)
                    //     .image;

                    const imageGatewayURL = highPreviewUrl
                        ? highPreviewUrl
                        : undefined;

                    console.log({ imageGatewayURL });
                    // if (
                    //     imageGatewayURL.includes('lotterynft') ||
                    //     [
                    //         '88279830972223375506659847640588682494880443313199730925423741164868176183297',
                    //     ].includes(nft.result.tokenId.toString())
                    // ) {
                    //     return;
                    // } else if (
                    //     !nft.symbol ||
                    //     ![
                    //         'RARI',
                    //         'Save Fud NFT Lab',
                    //         'ICE',
                    //         'OPENSTORE',
                    //         // 'ToshimonMinter',
                    //     ].includes(nft.symbol)
                    // ) {
                    //     return;
                    // } else if (imageGatewayURL.startsWith('https://')) {
                    //     imageGatewayURL = originalImageUrl;
                    // } else if (originalImageUrl.startsWith('ipfs://')) {
                    //     const imageUrlNoProtocol =
                    //         originalImageUrl.substring(12);
                    //     imageGatewayURL =
                    //         'https://ipfs.io/ipfs/' + imageUrlNoProtocol;
                    // }
                    IS_LOCAL_ENV &&
                        console.debug({ nftMatchingAllowList: nft });
                    if (imageGatewayURL)
                        fetch(imageGatewayURL)
                            .then((response) => response.blob())
                            .then((image) => {
                                if (image.type.includes('image')) {
                                    console.log({ image });
                                    // Create a local URL of that image
                                    const localUrl = URL.createObjectURL(image);
                                    imageLocalURLs.push(localUrl);
                                }
                            })
                            .catch(console.error);
                } else if (metadata) {
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
                        imageGatewayURL =
                            'https://ipfs.io/ipfs/' + imageUrlNoProtocol;
                    }
                    IS_LOCAL_ENV &&
                        console.debug({ nftMatchingAllowList: nft });
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
                            .catch(console.error);
                }
            });
            console.log({ imageLocalURLs });
            return imageLocalURLs;
        }
    } catch (e) {
        console.error(e);
    }
}
