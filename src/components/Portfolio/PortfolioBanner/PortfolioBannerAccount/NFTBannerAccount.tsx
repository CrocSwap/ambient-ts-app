import { useContext, useEffect } from 'react';
import { NFTBannerAccountContainer } from './NFTBannerAccountCss';
import {
    NftTokenContractBalanceItemIF,
    TokenBalanceContext,
} from '../../../../contexts/TokenBalanceContext';

export default function NFTBannerAccount() {
    const { NFTData } = useContext(TokenBalanceContext);

    useEffect(() => {
        NFTData?.forEach((item: NftTokenContractBalanceItemIF) => {
            console.log(item.nftData);
        });
    }, [NFTData]);

    return (
        <NFTBannerAccountContainer>
            {NFTData && (
                <div
                    style={{
                        padding: '10px',
                        display: 'flex',
                        justifyContent: 'space-evenly',
                        alignItems: 'center',
                        gap: '10px',
                    }}
                >
                    {NFTData.map((item, index) => (
                        <img
                            key={index}
                            alt='NFT'
                            style={{ width: '75px', height: '75px' }}
                            src={item.nftData[0].external_data.image}
                        ></img>
                    ))}
                </div>
            )}
        </NFTBannerAccountContainer>
    );
}
