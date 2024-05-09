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
    ScrollableContainer,
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
import useChatApi from '../../../Chat/Service/ChatApi';
import { MdOutlineCloudDownload } from 'react-icons/md';
import { useMediaQuery } from '@material-ui/core';

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
    setNftTestWalletInput: React.Dispatch<React.SetStateAction<string>>;
    nftTestWalletInput: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleTestWalletChange: any;
}

export default function NFTBannerAccount(props: NFTBannerAccountProps) {
    const {
        setShowNFTPage,
        NFTData,
        isfetchNftTriggered,
        setIsfetchNftTriggered,
        nftTestWalletInput,
        setNftTestWalletInput,
        handleTestWalletChange,
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

    const isMobile = useMediaQuery('(max-width: 800px)');

    const [nftContractName, setNftContractName] = useState<
        { name: string; address: string }[]
    >([]);

    const { saveUser } = useChatApi();

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [isContractNameOptionTabActive, setIsContractNameOptionTabActive] =
        useState<boolean>(false);

    const [selectedNFTContractAddress, setSelectedNFTContractAddress] =
        useState<{ name: string; address: string }>({
            name: 'All Nfts',
            address: 'all',
        });

    const [onErrorIndex] = useState<Array<number>>([]);

    const [isWalletPanelActive, setIsWalletPanelActive] = useState(false);

    const [isSelectThumbnail, setIsSelectThumbnail] = useState(false);

    const [selectedNft, setSelectedNft] = useState<NftDataIF | undefined>(
        undefined,
    );

    const [isDefaultNft, setIsDefaultNft] = useState(false);
    const [isDefaultThumbnail, setIsDefaultThumbnail] = useState(false);

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

        const jazzicon = {
            contractAddress: '',
            contractName: 'jazzicon',
            thumbnailUrl: '',
            cachedUrl: '',
        };

        // const blockie = {
        //     contractAddress: '',
        //     contractName: 'blockie',
        //     thumbnailUrl: '',
        //     cachedUrl: '',
        // };

        nftArray.push(jazzicon);
        // nftArray.push(blockie);

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
        if (
            (currentUserID === undefined || currentUserID.length === 0) &&
            userAddress
        ) {
            saveUser(userAddress, ensName ? ensName : '').then(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (result: any) => {
                    saveSelectedNFT(result.userData._id);
                },
            );
        } else {
            saveSelectedNFT(currentUserID);
        }
    }

    function saveSelectedNFT(userID: string | undefined) {
        if (userID) {
            if (selectedThumbnail) {
                setUserThumbnailNFT(() => selectedThumbnail.cachedUrl);
            } else if (selectedThumbnail === undefined) {
                setUserThumbnailNFT(() => '');
            }

            if (selectedNft && userProfileNFT !== selectedNft?.cachedUrl) {
                setUserProfileNFT(() => selectedNft.cachedUrl);
            } else if (selectedNft === undefined) {
                setUserProfileNFT(() => '');
            }

            updateUserWithAvatarImage(
                userID,
                selectedNft ? selectedNft.cachedUrl : '',
                selectedThumbnail ? selectedThumbnail.thumbnailUrl : '',
            );
        }
    }

    function openWalletAddressPanel(e: KeyboardEvent) {
        if (e.code === 'KeyQ' && e.altKey) {
            setIsWalletPanelActive((prev) => !prev);

            document.removeEventListener('keydown', openWalletAddressPanel);
        }
    }

    useEffect(() => {
        document.body.addEventListener('keydown', openWalletAddressPanel);
    }, []);

    const defaultAvatar = (type: string, walletID: string) => {
        return (
            <NFTImgContainer isMobile={isMobile}>
                <SelectedJazzIcon
                    selected={
                        isSelectThumbnail ? isDefaultThumbnail : isDefaultNft
                    }
                    isSelectThumbnail={isSelectThumbnail}
                    onClick={() => {
                        if (isSelectThumbnail) {
                            setIsDefaultThumbnail(true);
                            setSelectedThumbnail(undefined);
                        } else {
                            setIsDefaultNft(true);
                            setSelectedNft(undefined);
                        }
                    }}
                >
                    <Jazzicon
                        diameter={51}
                        seed={jsNumberForAddress(walletID.toLocaleLowerCase())}
                    />
                </SelectedJazzIcon>
            </NFTImgContainer>
        );
    };

    return (
        <NFTBannerAccountContainer
            isMobile={isMobile}
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
                            {!isDefaultNft &&
                            (selectedNft || userProfileNFT) ? (
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
                            {!isDefaultThumbnail && selectedThumbnail ? (
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
                    {isWalletPanelActive && (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '5px',
                            }}
                        >
                            <input
                                id='token_select_input_field'
                                spellCheck='false'
                                type='text'
                                value={nftTestWalletInput}
                                onChange={(e) =>
                                    setNftTestWalletInput(e.target.value)
                                }
                                placeholder=' Test wallet address'
                                style={{
                                    borderRadius: '3px',

                                    borderWidth: '1.5px',
                                    borderStyle: 'solid',
                                    borderColor: 'rgba(121, 133, 148, 0.7)',

                                    fontSize: '15px',
                                    color: 'rgba(204, 204, 204)',
                                    background: '#2f3d52',
                                }}
                            />
                            <MdOutlineCloudDownload
                                size={18}
                                onClick={() => {
                                    handleTestWalletChange(nftTestWalletInput);
                                }}
                            />
                        </div>
                    )}
                </NFTHeaderSettings>
            </div>

            {!isLoading ? (
                <ScrollableContainer>
                    <NFTDisplay template={nftArray.length}>
                        {nftArray.map((item: NftDataIF, index: number) =>
                            (item.contractName === 'jazzicon' ||
                                item.contractName === 'blockie') &&
                            userAddress
                                ? defaultAvatar(item.contractName, userAddress)
                                : item.cachedUrl && (
                                      <NFTImgContainer
                                          isMobile={isMobile}
                                          key={index}
                                          id='continer'
                                      >
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
                                                      setIsDefaultThumbnail(
                                                          false,
                                                      );
                                                      setSelectedThumbnail(
                                                          item,
                                                      );
                                                  } else {
                                                      setIsDefaultNft(false);
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
                                                  isMobile={isMobile}
                                              ></NFTImg>
                                              {selectedNft &&
                                                  item.cachedUrl ===
                                                      selectedNft.cachedUrl && (
                                                      <img
                                                          src={nftSelected}
                                                          style={{
                                                              position:
                                                                  'absolute',
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
                                                          src={
                                                              thumbnailSelected
                                                          }
                                                          style={{
                                                              position:
                                                                  'absolute',
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
                </ScrollableContainer>
            ) : (
                <Spinner size={100} bg='var(--dark2)' centered />
            )}

            <NFTBannerFooter>
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
