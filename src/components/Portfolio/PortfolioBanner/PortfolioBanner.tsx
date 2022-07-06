import styles from './PortfolioBanner.module.css';
// import nft1 from '../../../assets/images/Temporary/nft/nft1.png';
// import nft2 from '../../../assets/images/Temporary/nft/nft2.png';
// import nft3 from '../../../assets/images/Temporary/nft/nft3.png';
// import avatarImage from '../../../assets/images/Temporary/nft/avatar.png';
import Moralis from 'moralis';
import { useEffect, useState } from 'react';

import truncateAddress from '../../../utils/truncateAddress';

interface PortfolioBannerPropsIF {
    ensName: string;
    connectedAccount: string;
}

export default function PortfolioBanner(props: PortfolioBannerPropsIF) {
    const { ensName, connectedAccount } = props;
    const ensNameAvailable = ensName !== '';

    const [imageData, setImageData] = useState<string[]>([]);

    async function getNFTs() {
        const userEthNFTs = (
            await Moralis.Web3API.account.getNFTs({ address: connectedAccount })
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
                    const imageGatewayURL = 'https://ipfs.io/ipfs/' + imageUrlNoProtocol;
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
            setImageData(imageLocalURLs);
        }
    }

    useEffect(() => {
        if (connectedAccount) getNFTs();
    }, [connectedAccount]);

    const truncatedAccountAddress = truncateAddress(connectedAccount, 18);

    return (
        <div className={styles.rectangle_container}>
            {/* <div className={styles.background}></div> */}
            <div className={styles.account_container}>
                {imageData[0] ? <img src={imageData[0]} alt='avatar' /> : null}
                <div className={styles.account_names}>
                    <span className={styles.name}>
                        {ensNameAvailable ? ensName : truncatedAccountAddress}
                    </span>
                    <span className={styles.hash}>
                        {ensNameAvailable ? truncatedAccountAddress : connectedAccount}
                    </span>
                    {/* <span className={styles.hash}>0x284c...Ec38</span> */}
                </div>
            </div>

            <div className={styles.nft_container}>
                {imageData[1] ? <img src={imageData[1]} alt='nft' /> : null}
                {imageData[2] ? <img src={imageData[2]} alt='nft' /> : null}
                {imageData[3] ? <img src={imageData[3]} alt='nft' /> : null}
            </div>
        </div>
    );
}
