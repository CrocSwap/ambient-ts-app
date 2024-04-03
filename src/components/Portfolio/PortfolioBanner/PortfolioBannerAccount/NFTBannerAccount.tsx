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
} from './NFTBannerAccountCss';
import {
    NftDataIF,
    NftFetchSettingsIF,
    NftListByChain,
} from '../../../../contexts/TokenBalanceContext';
import Spinner from '../../../Global/Spinner/Spinner';
import nftPlaceHolder from '../../../../assets/images/Temporary/nft/nft-placeholder.svg';
import nftSelected from '../../../../assets/images/Temporary/nft/nft-profile-selected.svg';
import { VscClose } from 'react-icons/vsc';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { FiRefreshCw } from 'react-icons/fi';
import useChatApi from '../../../Chat/Service/ChatApi';
import useChatSocket from '../../../Chat/Service/useChatSocket';
import { trimString } from '../../../../ambient-utils/dataLayer';

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

    const [onErrorIndex] = useState<Array<number>>([]);

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
        console.log('selectedNft', selectedNft);
        console.log('userId', userId);
        if (selectedNft) {
            if (userId !== undefined) {
                updateUserWithAvatarImage(userId, selectedNft.originalUrl);
                setUserAccountProfile(() => selectedNft.originalUrl);
            }
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
                                        {nftContractName.map((item, index) => (
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
                <NFTDisplay template={nftArray.length}>
                    {nftArray.map((item: NftDataIF, index: number) => (
                        <NFTImgContainer key={index} id='continer'>
                            <CheckBoxContainer key={index}>
                                <NFTImg
                                    selected={
                                        selectedNft
                                            ? selectedNft.originalUrl ===
                                              item.originalUrl
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
                                        setIsContractNameOptionTabActive(false);
                                    }}
                                    src={
                                        item.originalUrl
                                            ? handleImgSrc(
                                                  onErrorIndex,
                                                  item.originalUrl,
                                                  index,
                                              )
                                            : nftPlaceHolder
                                    }
                                ></NFTImg>
                                {selectedNft &&
                                    item.originalUrl ===
                                        selectedNft.originalUrl && (
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
                            </CheckBoxContainer>
                        </NFTImgContainer>
                    ))}
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
                    Select
                </SaveButton>
            </NFTBannerFooter>
        </NFTBannerAccountContainer>
    );
}
