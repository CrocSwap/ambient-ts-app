import { useContext, useEffect, useState } from 'react';
import {
    NFTBannerAccountContainer,
    NFTBannerHeader,
    NFTDisplay,
} from './NFTBannerAccountCss';
import { TokenBalanceContext } from '../../../../contexts/TokenBalanceContext';
import Spinner from '../../../Global/Spinner/Spinner';
import nftPlaceHolder from '../../../../assets/images/Temporary/nft/nft-placeholder.svg';
import Divider from '../../../Global/Divider/Divider';
import { VscClose } from 'react-icons/vsc';

interface NFTBannerAccountProps {
    showNFTPage: boolean;
    setShowNFTPage: React.Dispatch<boolean>;
}

export default function NFTBannerAccount(props: NFTBannerAccountProps) {
    const { setShowNFTPage } = props;

    const { NFTData } = useContext(TokenBalanceContext);

    const [nftArray, setNftArray] = useState<any[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [onErrorIndex, setOnErrorIndex] = useState<Array<number>>([]);

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

    useEffect(() => {
        setIsLoading(() => {
            return nftArray.length > 0;
        });
    }, [nftArray]);

    function handleImgSrc(
        onErrorIndex: Array<number>,
        imgSrc: string,
        index: number,
    ): string {
        let returnAlt = false;
        if (onErrorIndex.length > 0) {
            onErrorIndex.map((errIndex) => {
                if (errIndex === index) returnAlt = true;
            });
            return returnAlt ? nftPlaceHolder : imgSrc;
        }
        return imgSrc;
    }

    return (
        <NFTBannerAccountContainer>
            <NFTBannerHeader>
                <div></div>
                <div style={{ transform: 'translate(50%, 0)' }}>NFTs</div>
                <VscClose size={25} onClick={() => setShowNFTPage(false)} />
            </NFTBannerHeader>
            {isLoading ? (
                <NFTDisplay>
                    {nftArray.map((item: any, index: number) => (
                        <img
                            key={index}
                            // alt='Content not found'
                            onError={() => onErrorIndex.push(index)}
                            style={{ width: '75px', height: '75px' }}
                            src={
                                item.external_data
                                    ? handleImgSrc(
                                          onErrorIndex,
                                          item.external_data.image,
                                          index,
                                      )
                                    : nftPlaceHolder
                            }
                        ></img>
                    ))}
                </NFTDisplay>
            ) : (
                <Spinner size={100} bg='var(--dark2)' centered />
            )}
        </NFTBannerAccountContainer>
    );
}
