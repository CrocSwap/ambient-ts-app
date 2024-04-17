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
    CheckBoxContainer,
    SelectedNftCotainer,
    NFTHeaderSettings,
    SelectedNFTImg,
    SelectedJazzIcon,
    IconContainer,
} from './NFTBannerAccountCss';
import {
    NftDataIF,
    NftFetchSettingsIF,
    NftListByChain,
} from '../../../../contexts/TokenBalanceContext';
import Spinner from '../../../Global/Spinner/Spinner';
import nftPlaceHolder from '../../../../assets/images/Temporary/nft/nft-placeholder.svg';
import nftSelected from '../../../../assets/images/Temporary/nft/nft-profile-selected.svg';
import thumbnailSelected from '../../../../assets/images/Temporary/nft/nft-thumbnail-selected.svg';
import { VscClose } from 'react-icons/vsc';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { FiRefreshCw } from 'react-icons/fi';
import useChatSocket from '../../../Chat/Service/useChatSocket';
import { trimString } from '../../../../ambient-utils/dataLayer';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

interface NFTBannerAccountProps {
    showNFTPage: boolean;
    setShowNFTPage: React.Dispatch<boolean>;
    NFTData: NftListByChain[];
    isfetchNftTriggered: boolean;
    setIsfetchNftTriggered: React.Dispatch<React.SetStateAction<boolean>>;
    NFTFetchSettings: NftFetchSettingsIF;
    setNFTFetchSettings: React.Dispatch<
        React.SetStateAction<NftFetchSettingsIF>
    >;
}

export default function NFTBannerAccount(props: NFTBannerAccountProps) {
    const {
        setShowNFTPage,
        NFTData,
        isfetchNftTriggered,
        setIsfetchNftTriggered,
        // NFTFetchSettings,
        // setNFTFetchSettings,
    } = props;

    const {
        currentUserID,
        userProfileNFT,
        setUserProfileNFT,
        userThumbnailNFT,
        setUserThumbnailNFT,
        userAddress,
        ensName,
    } = useContext(UserDataContext);

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

    const [onErrorIndex] = useState<Array<number>>([]);

    const [isSelectThumbnail, setIsSelectThumbnail] = useState(false);

    const [selectedNft, setSelectedNft] = useState<NftDataIF | undefined>(
        undefined,
    );
    const [selectedThumbnail, setSelectedThumbnail] = useState<
        NftDataIF | undefined
    >(undefined);

    const { updateUserWithAvatarImage } = useChatSocket(
        '',
        true,
        false,
        () => {
            console.log('show toastr from nft banner comp');
        },
        userAddress,
        ensName,
        currentUserID,
    );

    useEffect(() => {
        const selectedNFT = nftArray.find(
            (nft) => userProfileNFT === nft.cachedUrl,
        );
        userProfileNFT && selectedNFT && setSelectedNft(selectedNFT);
    }, [userProfileNFT, nftArray]);

    useEffect(() => {
        const selectedNFT = nftArray.find(
            (nft) => userThumbnailNFT === nft.thumbnailUrl,
        );
        userThumbnailNFT && selectedNFT && setSelectedThumbnail(selectedNFT);
    }, [userThumbnailNFT, nftArray]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nftContractName: any[] = [];
        nftContractName.push({ name: 'All Nfts', address: 'all' });

        NFTData?.map((item) => {
            item.data.map((nftData) => {
                if (
                    nftData.contractName &&
                    (nftContractName.length === 0 ||
                        !nftContractName.find(
                            (nft) => nft.address === nftData.contractAddress,
                        ))
                ) {
                    nftContractName.push({
                        name: nftData.contractName,
                        address: nftData.contractAddress,
                    });
                }
            });
        });

        setNftContractName(() => nftContractName);
    }, [NFTData]);

    useEffect(() => {
        const nftArray: NftDataIF[] = [];

        NFTData?.map((item) => {
            const nftData = item.data;
            nftData.map((element) => {
                if (
                    selectedNFTContractAddress.address === 'all' ||
                    selectedNFTContractAddress.address ===
                        element.contractAddress
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
        if (currentUserID) {
            if (isSelectThumbnail && selectedThumbnail) {
                setUserThumbnailNFT(() => selectedThumbnail.cachedUrl);
            } else if (selectedNft) {
                setUserProfileNFT(() => selectedNft.cachedUrl);
            }

            updateUserWithAvatarImage(
                currentUserID,
                selectedNft ? selectedNft.cachedUrl : '',
                selectedThumbnail ? selectedThumbnail.thumbnailUrl : '',
            );
        }
    }

    const pagination = <></>;

    return (
        <NFTBannerAccountContainer
            onClick={(event: React.MouseEvent<HTMLDivElement>) => {
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
                <NFTHeaderSettings>
                    <SelectedNftCotainer>
                        <IconContainer>
                            {selectedNft || userProfileNFT ? (
                                <SelectedNFTImg
                                    selected={!isSelectThumbnail}
                                    isSelectThumbnail={false}
                                    onClick={(
                                        event: React.MouseEvent<HTMLDivElement>,
                                    ) => {
                                        event.stopPropagation();
                                        setIsSelectThumbnail(false);
                                        setIsContractNameOptionTabActive(false);
                                    }}
                                    src={
                                        selectedNft
                                            ? selectedNft.cachedUrl
                                            : userProfileNFT
                                    }
                                ></SelectedNFTImg>
                            ) : (
                                <SelectedJazzIcon
                                    selected={!isSelectThumbnail}
                                    isSelectThumbnail={false}
                                    onClick={(
                                        event: React.MouseEvent<HTMLDivElement>,
                                    ) => {
                                        event.stopPropagation();
                                        setIsSelectThumbnail(false);
                                        setIsContractNameOptionTabActive(false);
                                    }}
                                >
                                    <Jazzicon
                                        diameter={51}
                                        seed={jsNumberForAddress(
                                            userAddress
                                                ? userAddress.toLocaleLowerCase()
                                                : '',
                                        )}
                                    />
                                </SelectedJazzIcon>
                            )}
                            <div>Profile</div>
                        </IconContainer>
                        <IconContainer>
                            {selectedThumbnail ? (
                                <SelectedNFTImg
                                    selected={isSelectThumbnail}
                                    isSelectThumbnail={true}
                                    onClick={(
                                        event: React.MouseEvent<HTMLDivElement>,
                                    ) => {
                                        event.stopPropagation();
                                        setIsSelectThumbnail(true);
                                        setIsContractNameOptionTabActive(false);
                                    }}
                                    src={
                                        selectedThumbnail
                                            ? selectedThumbnail.thumbnailUrl
                                            : nftPlaceHolder
                                    }
                                ></SelectedNFTImg>
                            ) : (
                                <SelectedJazzIcon
                                    selected={isSelectThumbnail}
                                    isSelectThumbnail={true}
                                    onClick={(
                                        event: React.MouseEvent<HTMLDivElement>,
                                    ) => {
                                        event.stopPropagation();
                                        setIsSelectThumbnail(true);
                                        setIsContractNameOptionTabActive(false);
                                    }}
                                >
                                    <Jazzicon
                                        diameter={51}
                                        seed={jsNumberForAddress(
                                            userAddress
                                                ? userAddress.toLocaleLowerCase()
                                                : '',
                                        )}
                                    />
                                </SelectedJazzIcon>
                            )}
                            <div>Thumbnail</div>
                        </IconContainer>
                    </SelectedNftCotainer>
                    {nftContractName.length > 0 && (
                        <NFTBannerFilter>
                            <DropDownContainer>
                                <DropDownHeader
                                    onClick={(
                                        event: React.MouseEvent<HTMLDivElement>,
                                    ) => {
                                        event.stopPropagation();
                                        setIsContractNameOptionTabActive(
                                            !isContractNameOptionTabActive,
                                        );
                                    }}
                                >
                                    <div>
                                        {trimString(
                                            selectedNFTContractAddress.name,
                                            15,
                                            0,
                                            '…',
                                        )}
                                    </div>
                                    <LabelSettingsArrow
                                        isActive={isContractNameOptionTabActive}
                                    ></LabelSettingsArrow>
                                </DropDownHeader>

                                {isContractNameOptionTabActive && (
                                    <DropDownListContainer>
                                        <DropDownList>
                                            {nftContractName.map(
                                                (item, index) => (
                                                    <ListItem
                                                        backgroundColor={
                                                            item.address ===
                                                            selectedNFTContractAddress.address
                                                                ? '#434c58'
                                                                : undefined
                                                        }
                                                        key={index}
                                                        onClick={(
                                                            event: React.MouseEvent<HTMLElement>,
                                                        ) => {
                                                            event.stopPropagation();
                                                            setSelectedNFTContractAddress(
                                                                item,
                                                            );
                                                            setIsContractNameOptionTabActive(
                                                                false,
                                                            );
                                                        }}
                                                    >
                                                        {item.name}
                                                    </ListItem>
                                                ),
                                            )}
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
                </NFTHeaderSettings>
            </div>

            {!isLoading ? (
                <NFTDisplay template={nftArray.length}>
                    {nftArray.map(
                        (item: NftDataIF, index: number) =>
                            item.cachedUrl && (
                                <NFTImgContainer key={index} id='continer'>
                                    <CheckBoxContainer
                                        key={index}
                                        onClick={(
                                            event: React.MouseEvent<HTMLDivElement>,
                                        ) => {
                                            event.stopPropagation();
                                            setIsContractNameOptionTabActive(
                                                false,
                                            );
                                            if (isSelectThumbnail) {
                                                setSelectedThumbnail(item);
                                            } else {
                                                setSelectedNft(item);
                                            }
                                        }}
                                    >
                                        <NFTImg
                                            selectedNFT={
                                                selectedNft
                                                    ? selectedNft.cachedUrl ===
                                                      item.cachedUrl
                                                    : false
                                            }
                                            selectedThumbnail={
                                                selectedThumbnail
                                                    ? selectedThumbnail.thumbnailUrl ===
                                                      item.thumbnailUrl
                                                    : false
                                            }
                                            isSelectThumbnail={
                                                isSelectThumbnail
                                            }
                                            key={index}
                                            // alt='Content not found'
                                            onError={() =>
                                                onErrorIndex.push(index)
                                            }
                                            src={
                                                item.cachedUrl
                                                    ? handleImgSrc(
                                                          onErrorIndex,
                                                          isSelectThumbnail
                                                              ? item.thumbnailUrl
                                                              : item.cachedUrl,
                                                          index,
                                                      )
                                                    : nftPlaceHolder
                                            }
                                        ></NFTImg>
                                        {selectedNft &&
                                            item.cachedUrl ===
                                                selectedNft.cachedUrl && (
                                                <img
                                                    src={nftSelected}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '72%',
                                                        left: '72%',
                                                        width: '20px',
                                                        height: '20px',
                                                    }}
                                                    alt=''
                                                />
                                            )}
                                        {selectedThumbnail &&
                                            item.thumbnailUrl ===
                                                selectedThumbnail.thumbnailUrl && (
                                                <img
                                                    src={thumbnailSelected}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '72%',
                                                        left: '72%',
                                                        width: '20px',
                                                        height: '20px',
                                                    }}
                                                    alt=''
                                                />
                                            )}
                                    </CheckBoxContainer>
                                </NFTImgContainer>
                            ),
                    )}
                </NFTDisplay>
            ) : (
                <Spinner size={100} bg='var(--dark2)' centered />
            )}

            <NFTBannerFooter>
                {pagination}
                <SaveButton
                    onClick={(event: React.MouseEvent<HTMLDivElement>) => {
                        event.stopPropagation();
                        handleNftSelection();
                    }}
                >
                    Save
                </SaveButton>
            </NFTBannerFooter>
        </NFTBannerAccountContainer>
    );
}
