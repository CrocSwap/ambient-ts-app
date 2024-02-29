import React, { useContext, useEffect, useState } from 'react';
import {
    DropDownContainer,
    DropDownHeader,
    DropDownList,
    DropDownListContainer,
    LabelSettingsArrow,
    ListItem,
    NFTBannerAccountContainer,
    NFTBannerFilter,
    NFTBannerHeader,
    NFTDisplay,
    NFTImgContainer,
    NFTBannerFooter,
    SaveButton,
    NFTImg,
} from './NFTBannerAccountCss';
import {
    NftDataIF,
    NftListByChain,
    TokenBalanceContext,
} from '../../../../contexts/TokenBalanceContext';
import Spinner from '../../../Global/Spinner/Spinner';
import nftPlaceHolder from '../../../../assets/images/Temporary/nft/nft-placeholder.svg';
import nftSelected from '../../../../assets/images/Temporary/nft/nft-profile-selected.svg';
import { VscClose } from 'react-icons/vsc';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { FiRefreshCw } from 'react-icons/fi';
import useChatApi from '../../../Chat/Service/ChatApi';
import useChatSocket from '../../../Chat/Service/useChatSocket';

interface NFTBannerAccountProps {
    showNFTPage: boolean;
    setShowNFTPage: React.Dispatch<boolean>;
    NFTData: NftListByChain[] | undefined;
    isfetchNftTriggered: boolean;
    setIsfetchNftTriggered: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function NFTBannerAccount(props: NFTBannerAccountProps) {
    const {
        setShowNFTPage,
        NFTData,
        isfetchNftTriggered,
        setIsfetchNftTriggered,
    } = props;

    const { setUserAccountProfile, userAddress, ensName } =
        useContext(UserDataContext);

    const [nftArray, setNftArray] = useState<NftDataIF[]>([]);

    const [nftContractName, setNftContractName] = useState<
        { name: string; address: string }[]
    >([]);

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [isContractNameOptionTabActive, setIsContractNameOptionTabActive] =
        useState<boolean>(false);

    const [selectedNFTContractAddress, setSelectedNFTContractAddress] =
        useState<{ name: string; address: string }>({
            name: 'All Nfts',
            address: 'all',
        });

    const [onErrorIndex, setOnErrorIndex] = useState<Array<number>>([]);

    const [selectedNft, setSelectedNft] = useState<NftDataIF | undefined>(
        undefined,
    );

    const { saveUser } = useChatApi();

    const [userId, setUserId] = useState<string>('');

    const { updateUserWithAvatarImage } = useChatSocket(
        '',
        true,
        false,
        () => {
            console.log('show toastr from nft banner comp');
        },
        userAddress,
        ensName,
        userId,
    );

    useEffect(() => {
        const userRegister = async () => {
            if (userAddress && ensName) {
                const userId = await saveUser(userAddress, ensName);
                console.log('userId', userId);
                setUserId(userId.userData._id);
            }
        };
        userRegister();
    }, []);

    useEffect(() => {
        const nftContractName: any[] = [];

        console.log(NFTData);

        NFTData?.map((item) => {
            nftContractName.push({
                name: item.contractName,
                address: item.contractAddress,
            });
        });

        nftContractName.push({ name: 'All Nfts', address: 'all' });
        setNftContractName(() => nftContractName);
    }, [NFTData]);

    useEffect(() => {
        const nftArray: NftDataIF[] = [];

        NFTData?.map((item) => {
            const nftData = item.data;

            nftData.map((element) => {
                if (
                    selectedNFTContractAddress.address === 'all' ||
                    selectedNFTContractAddress.address === item.contractAddress
                )
                    nftArray.push(element);
            });
        });

        setNftArray(() => nftArray);
    }, [NFTData, selectedNFTContractAddress]);

    useEffect(() => {
        setIsLoading(() => {
            return isfetchNftTriggered || nftArray.length < 1;
        });
    }, [nftArray, isfetchNftTriggered]);

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

    async function handleNftSelection() {
        console.log('selectedNft', selectedNft);
        console.log('userId', userId);
        if (selectedNft) {
            if (userId !== undefined) {
                updateUserWithAvatarImage(userId, selectedNft.nftImage);
                setUserAccountProfile(() => selectedNft.nftImage);
            }
        }
    }

    return (
        <NFTBannerAccountContainer
            onClick={(event: any) => {
                event.stopPropagation();
                setIsContractNameOptionTabActive(false);
            }}
        >
            <div>
                <NFTBannerHeader>
                    <div></div>
                    <div style={{ transform: 'translate(50%, 0)' }}>NFTs</div>
                    <VscClose
                        size={25}
                        onClick={() => {
                            setShowNFTPage(false);
                        }}
                    />
                </NFTBannerHeader>
                {nftContractName.length > 0 && (
                    <NFTBannerFilter>
                        <DropDownContainer>
                            <DropDownHeader
                                onClick={(event: any) => {
                                    event.stopPropagation();
                                    setIsContractNameOptionTabActive(
                                        !isContractNameOptionTabActive,
                                    );
                                }}
                            >
                                <div>{selectedNFTContractAddress.name}</div>
                                <LabelSettingsArrow
                                    isActive={isContractNameOptionTabActive}
                                ></LabelSettingsArrow>
                            </DropDownHeader>

                            {isContractNameOptionTabActive && (
                                <DropDownListContainer>
                                    <DropDownList>
                                        {nftContractName.map((item, index) => (
                                            <ListItem
                                                backgroundColor={
                                                    item.address ===
                                                    selectedNFTContractAddress.address
                                                        ? '#434c58'
                                                        : undefined
                                                }
                                                key={index}
                                                onClick={(event: any) => {
                                                    event.stopPropagation();
                                                    setSelectedNFTContractAddress(
                                                        item,
                                                    );
                                                }}
                                            >
                                                {item.name}
                                            </ListItem>
                                        ))}
                                    </DropDownList>
                                </DropDownListContainer>
                            )}
                        </DropDownContainer>

                        <FiRefreshCw
                            size={18}
                            onClick={() => {
                                setIsfetchNftTriggered(() => true);
                            }}
                        />
                    </NFTBannerFilter>
                )}
            </div>

            {!isLoading ? (
                <NFTDisplay>
                    {nftArray.map((item: any, index: number) => (
                        <NFTImgContainer key={index}>
                            <NFTImg
                                selected={
                                    selectedNft
                                        ? selectedNft.tokenUrl === item.tokenUrl
                                        : false
                                }
                                key={index}
                                // alt='Content not found'
                                onError={() => onErrorIndex.push(index)}
                                onClick={(
                                    event: React.MouseEvent<HTMLDivElement>,
                                ) => {
                                    event.stopPropagation();
                                    setSelectedNft(item);
                                }}
                                src={
                                    item.nftImage
                                        ? handleImgSrc(
                                              onErrorIndex,
                                              item.nftImage,
                                              index,
                                          )
                                        : nftPlaceHolder
                                }
                            ></NFTImg>
                            {selectedNft &&
                                item.tokenUrl === selectedNft.tokenUrl && (
                                    <img
                                        src={nftSelected}
                                        style={{
                                            position: 'absolute',
                                            top: '72%',
                                            left: '68%',
                                            width: '20px',
                                            height: '20px',
                                        }}
                                        alt=''
                                    />
                                )}
                        </NFTImgContainer>
                    ))}
                </NFTDisplay>
            ) : (
                <Spinner size={100} bg='var(--dark2)' centered />
            )}

            <NFTBannerFooter>
                <SaveButton
                    onClick={(event: any) => {
                        event.stopPropagation();
                        handleNftSelection();
                    }}
                >
                    Select
                </SaveButton>
            </NFTBannerFooter>
        </NFTBannerAccountContainer>
    );
}
