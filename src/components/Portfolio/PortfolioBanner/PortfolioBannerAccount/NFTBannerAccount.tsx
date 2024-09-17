import React, { useContext, useEffect, useRef, useState } from 'react';
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
    HeaderText,
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
import useChatApi from '../../../Chat/Service/ChatApi';
import { MdOutlineCloudDownload } from 'react-icons/md';
import { useMediaQuery } from '@material-ui/core';
import { getAvatarForType } from '../../../Chat/ChatRenderUtils';
import { isAutoGeneratedAvatar } from '../../../Chat/ChatUtils';
import useOnClickOutside from '../../../../utils/hooks/useOnClickOutside';
import ChatToaster from '../../../Chat/ChatToaster/ChatToaster';

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
    const [nftThumbnailCount, setNftThumbnailCount] = useState<
        number | undefined
    >(undefined);

    const isMobile = useMediaQuery('(max-width: 800px)');

    const [nftContractName, setNftContractName] = useState<
        { name: string; address: string }[]
    >([]);

    const { saveUser, verifyWalletService, isUserVerified } = useChatApi();

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

    const [isSaveActive, setIsSaveActive] = useState<number>(0);

    const [isVerified, setIsVerified] = useState(false);

    const [selectedNft, setSelectedNft] = useState<NftDataIF | undefined>(
        undefined,
    );

    const [selectedThumbnail, setSelectedThumbnail] = useState<
        NftDataIF | undefined
    >(undefined);

    const { updateUserWithAvatarImage, addListener, updateUserCache } =
        useChatSocket('', true, true, () => {
            console.log('show toastr from nft banner comp');
        });

    useEffect(() => {
        async function checkVerified() {
            const data = await isUserVerified();
            if (!data) return setIsVerified(false);
            setIsVerified(data.verified);
        }

        checkVerified();
    }, []);

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

        if (nftContractName && nftContractName.length > 0) {
            nftContractName.push({ name: 'All Nfts', address: 'all' });
        }

        setNftContractName(() => nftContractName);
    }, [NFTData]);

    useEffect(() => {
        const nftArray: NftDataIF[] = [];

        const jazzicon = {
            contractAddress: '',
            contractName: 'jazzicon',
            thumbnailUrl: '_jazz_',
            cachedUrl: '_jazz_',
            isAutoGenerated: true,
        };

        const blockie = {
            contractAddress: '',
            contractName: 'blockie',
            thumbnailUrl: '_blockie_',
            cachedUrl: '_blockie_',
            isAutoGenerated: true,
        };

        nftArray.push(jazzicon);
        nftArray.push(blockie);

        let thumbnailArrayLength = 2;

        NFTData?.map((item) => {
            const nftData = item.data;
            nftData.map((element) => {
                if (
                    selectedNFTContractAddress.address === 'all' ||
                    selectedNFTContractAddress.address ===
                        element.contractAddress
                ) {
                    nftArray.push(element);
                    if (element.thumbnailUrl) {
                        thumbnailArrayLength = thumbnailArrayLength + 1;
                    }
                }
            });
        });

        setNftArray(() => nftArray);
        setNftThumbnailCount(() => thumbnailArrayLength);
    }, [NFTData, selectedNFTContractAddress]);

    useEffect(() => {
        setIsLoading(() => {
            return isfetchNftTriggered || nftArray.length < 1;
        });
    }, [nftArray, isfetchNftTriggered]);

    const [toastrActive, setToastrActive] = useState(false);
    const [toastrType, setToastrType] = useState<
        'success' | 'error' | 'warning' | 'info'
    >('info');
    const [toastrText, setToastrText] = useState('');

    const activateToastr = (
        message: string,
        type: 'success' | 'error' | 'warning' | 'info',
    ) => {
        setToastrActive(true);
        setToastrText(message);
        setToastrType(type);
    };

    const verifyWallet = async (
        verificationDate: Date,
        userID: string | undefined,
    ) => {
        if (isVerified) return;

        verifyWalletService(verificationDate).then(async () => {
            activateToastr('Your wallet is verified!', 'success');
            updateUserCache();
            setIsVerified(true);

            if (userID) {
                updateUserWithAvatarImage(
                    userID,
                    userAddress ? userAddress : '',
                    selectedNft ? selectedNft.cachedUrl : '',
                    selectedThumbnail ? selectedThumbnail.thumbnailUrl : '',
                    selectedNft ? selectedNft.thumbnailUrl : '',
                );

                setIsSaveActive(2);
                const savedTimeOut = setTimeout(() => {
                    setIsSaveActive(0);
                }, 1000);
                return () => {
                    clearTimeout(savedTimeOut);
                };
            }
        });
    };

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
        if (isVerified) {
            if (userID) {
                updateUserWithAvatarImage(
                    userID,
                    userAddress ? userAddress : '',
                    selectedNft ? selectedNft.cachedUrl : '',
                    selectedThumbnail ? selectedThumbnail.thumbnailUrl : '',
                    selectedNft ? selectedNft.thumbnailUrl : '',
                );

                setIsSaveActive(2);
                const savedTimeOut = setTimeout(() => {
                    setIsSaveActive(0);
                }, 1000);
                return () => {
                    clearTimeout(savedTimeOut);
                };
            }
        } else {
            verifyWallet(new Date(), userID);
        }
    }

    function openWalletAddressPanel(e: KeyboardEvent) {
        if (e.code === 'KeyQ' && e.altKey) {
            setIsWalletPanelActive((prev) => !prev);

            document.removeEventListener('keydown', openWalletAddressPanel);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const socketAvatarSetListener = (payload: any) => {
        if (payload.walletID == userAddress) {
            setUserThumbnailNFT(() => payload.avatarThumbnail);
            setUserProfileNFT(() => payload.avatarImage);
        }
    };

    useEffect(() => {
        document.body.addEventListener('keydown', openWalletAddressPanel);
        addListener({
            msg: 'set-avatar-listener',
            componentId: 'NFTBannerAccount',
            listener: socketAvatarSetListener,
        });
    }, [isVerified]);

    const defaultAvatar = (walletID: string, nftData: NftDataIF) => {
        return (
            <NFTImgContainer isMobile={isMobile}>
                <SelectedJazzIcon
                    selected={
                        isSelectThumbnail
                            ? nftData.cachedUrl == selectedThumbnail?.cachedUrl
                            : nftData.cachedUrl == selectedNft?.cachedUrl
                    }
                    isSelectThumbnail={isSelectThumbnail}
                    onClick={() => {
                        if (isSelectThumbnail) {
                            setSelectedThumbnail(nftData);
                        } else {
                            setSelectedNft(nftData);
                        }
                    }}
                >
                    {getAvatarForType(walletID, nftData.cachedUrl, 51)}
                </SelectedJazzIcon>
            </NFTImgContainer>
        );
    };

    const NftComponentItemRef = useRef<HTMLDivElement>(null);

    const clickOutsideHandler = () => {
        setShowNFTPage(false);
    };

    useOnClickOutside(NftComponentItemRef, clickOutsideHandler);

    const handleSaveButtonClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        
        if (isSaveActive === 0) {
            handleNftSelection();
            setIsSaveActive(!isVerified ? 3 : 1);
           
        }
        
      };
      

    return (

        
        <NFTBannerAccountContainer
            isMobile={isMobile}
            onClick={(event: React.MouseEvent<HTMLDivElement>) => {
                event.stopPropagation();
                setIsContractNameOptionTabActive(false);
            }}
            ref={NftComponentItemRef}
            
        >
            <div>
                <NFTBannerHeader>
                    <div style={{ width: '25px' }}>
                        <FiRefreshCw
                            size={18}
                            onClick={() => {
                                setIsfetchNftTriggered(() => true);
                            }}
                        />
                    </div>
                    <HeaderText>Select Avatar</HeaderText>
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
                            {(selectedNft &&
                                !isAutoGeneratedAvatar(
                                    selectedNft.cachedUrl,
                                )) ||
                            (!selectedNft &&
                                userProfileNFT &&
                                !isAutoGeneratedAvatar(userProfileNFT)) ? (
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
                                    {userAddress &&
                                        getAvatarForType(
                                            userAddress,
                                            selectedNft
                                                ? selectedNft.cachedUrl
                                                : userProfileNFT
                                                  ? userProfileNFT
                                                  : '',
                                            51,
                                        )}
                                </SelectedJazzIcon>
                            )}
                            <HeaderText fontSize={'13px'}>Profile</HeaderText>
                        </IconContainer>
                        <IconContainer>
                            {/* {!isDefaultThumbnail && selectedThumbnail ? ( */}
                            {(selectedThumbnail &&
                                !isAutoGeneratedAvatar(
                                    selectedThumbnail.cachedUrl,
                                )) ||
                            (!selectedThumbnail &&
                                userThumbnailNFT &&
                                !isAutoGeneratedAvatar(userThumbnailNFT)) ? (
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
                                    {userAddress &&
                                        getAvatarForType(
                                            userAddress,
                                            selectedThumbnail
                                                ? selectedThumbnail.cachedUrl
                                                : userThumbnailNFT
                                                  ? userThumbnailNFT
                                                  : '',
                                            51,
                                        )}
                                </SelectedJazzIcon>
                            )}
                            <HeaderText fontSize={'13px'}>Thumbnail</HeaderText>
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
                <ScrollableContainer isMobile={isMobile}>
                    <NFTDisplay
                        template={
                            isSelectThumbnail && nftThumbnailCount
                                ? nftThumbnailCount
                                : nftArray.length
                        }
                    >
                        {nftArray.map((item: NftDataIF, index: number) =>
                            item.isAutoGenerated && userAddress
                                ? defaultAvatar(userAddress, item)
                                : ((!isSelectThumbnail && item.cachedUrl) ||
                                      (isSelectThumbnail &&
                                          item.thumbnailUrl)) && (
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
                                                      setSelectedThumbnail(
                                                          item,
                                                      );
                                                  } else {
                                                      setSelectedNft(item);
                                                  }
                                              }}
                                          >
                                              <NFTImg
                                                  selectedNFT={
                                                      !isSelectThumbnail &&
                                                      selectedNft
                                                          ? selectedNft.cachedUrl ===
                                                            item.cachedUrl
                                                          : false
                                                  }
                                                  selectedThumbnail={
                                                      isSelectThumbnail &&
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
                                              {!isSelectThumbnail &&
                                                  selectedNft &&
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
                                              {isSelectThumbnail &&
                                                  selectedThumbnail &&
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
                    isActive={isSaveActive}
                    onClick={ handleSaveButtonClick}
                >
                    {isSaveActive === 1
                        ? 'Saving..'
                        : isSaveActive === 2
                          ? 'Saved'
                          : isSaveActive === 3
                            ? 'Verifying...'
                            : 'Save'}
                </SaveButton>
            </NFTBannerFooter>

            <ChatToaster
                isActive={toastrActive}
                activator={setToastrActive}
                text={toastrText}
                type={toastrType}
            />
            </NFTBannerAccountContainer>
           
    );
}
