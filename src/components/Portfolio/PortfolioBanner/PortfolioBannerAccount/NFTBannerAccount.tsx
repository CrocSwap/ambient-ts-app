import { useContext, useEffect, useState } from 'react';
import {
    NFTBannerAccountContainer,
    NFTBannerHeader,
} from './NFTBannerAccountCss';
import { TokenBalanceContext } from '../../../../contexts/TokenBalanceContext';

interface NFTBannerAccountProps {
    showNFTPage: boolean;
    setShowNFTPage: React.Dispatch<boolean>;
}

export default function NFTBannerAccount(props: NFTBannerAccountProps) {
    const { setShowNFTPage } = props;

    const { NFTData } = useContext(TokenBalanceContext);

    const [nftArray, setNftArray] = useState<any[]>([]);

    useEffect(() => {
        const nftArray: any[] = [];
        NFTData?.map((item) => {
            const nftData = Object.values(item.nftData);
            nftData.map((element) => {
                nftArray.push(element);
            });
        });
        setNftArray(() => nftArray);
    }, [NFTData]);

    return (
        <NFTBannerAccountContainer>
            <NFTBannerHeader onClick={() => setShowNFTPage(false)}>
                <div>NFTs</div>
                <div> </div>
            </NFTBannerHeader>
            {NFTData && nftArray && (
                <div
                    style={{
                        padding: '10px',
                        justifyContent: 'space-evenly',
                        alignItems: 'center',
                        gap: '10px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                    }}
                >
                    {nftArray.map((item: any, index: number) => (
                        <img
                            key={index}
                            alt='NFT'
                            style={{ width: '75px', height: '75px' }}
                            src={item.external_data.image}
                        ></img>
                    ))}
                </div>
            )}
        </NFTBannerAccountContainer>
    );
}
