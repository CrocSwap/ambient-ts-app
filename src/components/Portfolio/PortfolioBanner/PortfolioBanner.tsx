import styles from './PortfolioBanner.module.css';
import nft1 from '../../../assets/images/Temporary/nft/nft1.png';
import nft2 from '../../../assets/images/Temporary/nft/nft2.png';
import nft3 from '../../../assets/images/Temporary/nft/nft3.png';
import avatarImage from '../../../assets/images/Temporary/nft/avatar.png';
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

    const [nftAvatarImageURL, setNFTAvatarImageURL] = useState(avatarImage);

    async function getNFTs() {
        // const options = { chain: 'eth', address: connectedAccount };
        const userEthNFTs = (
            await Moralis.Web3API.account.getNFTs({ address: connectedAccount })
        ).result?.filter((nft) => nft.contract_type === 'ERC1155');

        if (userEthNFTs) {
            const metadataOfFirstNFT = userEthNFTs[0].metadata;
            if (metadataOfFirstNFT) {
                const parsedMetadata = JSON.parse(metadataOfFirstNFT);
                const imageURL = parsedMetadata.image;
                const imageUrlNoProtocol = imageURL.substring(12);
                const imageGatewayURL = 'https://ipfs.io/ipfs/' + imageUrlNoProtocol;
                setNFTAvatarImageURL(imageGatewayURL);
            } else {
                setNFTAvatarImageURL(avatarImage);
            }
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
                <img src={nftAvatarImageURL} alt='avatar' />
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
                <img src={nft1} alt='nft' />
                <img src={nft2} alt='nft' />
                <img src={nft3} alt='nft' />
            </div>
        </div>
    );
}
