// import noAvatarImage from '../../../../assets/images/icons/avatar.svg';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import { useContext, useEffect, useState } from 'react';
interface IPortfolioBannerAccountPropsIF {
    ensName: string;
    resolvedAddress: string;
    truncatedAccountAddress: string;
    ensNameAvailable: boolean;
    jazziconsToDisplay: JSX.Element | null;
}
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { FlexContainer } from '../../../../styled/Common';
import {
    PortfolioBannerMainContainer,
    ProfileSettingsContainer,
} from '../../../../styled/Components/Portfolio';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import NFTBannerAccount from './NFTBannerAccount';
import { TokenBalanceContext } from '../../../../contexts/TokenBalanceContext';
import { getAvatarForProfilePage } from '../../../Chat/ChatRenderUtils';
import useChatApi from '../../../Chat/Service/ChatApi';
import { domDebug } from '../../../Chat/DomDebugger/DomDebuggerUtils';
import { MdOutlineCloudDownload } from 'react-icons/md';
import { trimString } from '../../../../ambient-utils/dataLayer';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';

export default function PortfolioBannerAccount(
    props: IPortfolioBannerAccountPropsIF,
) {
    const [showAccountDetails, setShowAccountDetails] = useState(false);
    const [showNFTPage, setShowNFTPage] = useState(false);

    const {
        ensName,
        resolvedAddress,
        truncatedAccountAddress,
        ensNameAvailable,
    } = props;

    const {
        userAddress,
        userProfileNFT,
        isfetchNftTriggered,
        setIsfetchNftTriggered,
        setUserProfileNFT,
        setUserThumbnailNFT,
        setNftTestWalletAddress,
    } = useContext(UserDataContext);

    const { NFTData, NFTFetchSettings, setNFTFetchSettings } =
        useContext(TokenBalanceContext);

    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);
    const {
        chainData: { blockExplorer, chainId },
    } = useContext(CrocEnvContext);
    const isSmallScreen = useMediaQuery('(max-width: 800px)');

    const ensNameToDisplay = ensName !== '' ? ensName : truncatedAccountAddress;

    const addressToDisplay = resolvedAddress
        ? resolvedAddress
        : ensNameAvailable
        ? truncatedAccountAddress
        : userAddress;

    const [_, copy] = useCopyToClipboard();

    const { getUserAvatar } = useChatApi();

    useEffect(() => {
        const fetchAvatar = async () => {
            if (userAddress) {
                const avatar = await getUserAvatar(
                    resolvedAddress !== undefined && resolvedAddress.length > 0
                        ? resolvedAddress
                        : userAddress,
                );
                setUserProfileNFT(avatar.avatarImage);
                setUserThumbnailNFT(avatar.avatarThumbnail);
            }
        };
        fetchAvatar();
    }, [resolvedAddress, userAddress]);

    useEffect(() => {
        setShowNFTPage(false);
    }, [resolvedAddress]);

    domDebug('resolved address', resolvedAddress);
    domDebug('user address', userAddress);
    domDebug('ua_profile', userProfileNFT);

    function handleCopyEnsName() {
        copy(
            ensNameAvailable
                ? ensName
                : resolvedAddress
                ? resolvedAddress
                : userAddress ?? '',
        );
        const copiedData = ensNameAvailable
            ? ensName
            : resolvedAddress
            ? resolvedAddress
            : userAddress;

        openSnackbar(`${copiedData} copied`, 'info');
    }
    function handleCopyAddress() {
        copy(resolvedAddress ? resolvedAddress : userAddress ?? '');
        const copiedData = resolvedAddress ? resolvedAddress : userAddress;

        openSnackbar(`${copiedData} copied`, 'info');
    }

    function handleOpenExplorer(address: string) {
        if (address && blockExplorer) {
            const explorerUrl = `${blockExplorer}address/${address}`;
            window.open(explorerUrl);
        }
    }

    // Nft Fetch For Test Wallet
    const [isWalletPanelActive, setIsWalletPanelActive] = useState(false);

    function openWalletAddressPanel(e: KeyboardEvent) {
        if (e.code === 'KeyQ' && e.altKey) {
            setIsWalletPanelActive((prev) => !prev);

            document.removeEventListener('keydown', openWalletAddressPanel);
        }
    }

    useEffect(() => {
        document.body.addEventListener('keydown', openWalletAddressPanel);
    }, []);

    const [nftTestWalletInput, setNftTestWalletInput] = useState<string>('');

    function handleTestWalletChange(nftTestWalletInput: string) {
        setNftTestWalletAddress(() => nftTestWalletInput);
        setIsfetchNftTriggered(() => true);
    }

    return (
        <PortfolioBannerMainContainer
            animate={showAccountDetails ? 'open' : 'closed'}
        >
            <FlexContainer
                alignItems='flex-end'
                zIndex={1}
                gap={22}
                onClick={() => setShowAccountDetails(!showAccountDetails)}
            >
                <span
                    onClick={() => {
                        !(
                            resolvedAddress !== undefined &&
                            resolvedAddress.length > 0
                        ) && setShowNFTPage(!showNFTPage);
                    }}
                >
                    <ProfileSettingsContainer
                        placement={NFTData ? true : false}
                    >
                        {userAddress &&
                            getAvatarForProfilePage(
                                userAddress,
                                userProfileNFT,
                                65,
                                resolvedAddress !== undefined &&
                                    resolvedAddress.length > 0
                                    ? false
                                    : NFTData &&
                                          NFTData.find(
                                              (nftChainList) =>
                                                  nftChainList.chainId ===
                                                  chainId,
                                          ) &&
                                          NFTData.find(
                                              (nftChainList) =>
                                                  nftChainList.chainId ===
                                                  chainId,
                                          )?.userHasNFT &&
                                          true,
                            )}
                    </ProfileSettingsContainer>
                </span>

                <FlexContainer flexDirection='column' gap={4}>
                    <FlexContainer
                        fontWeight='300'
                        fontSize='header1'
                        cursor='pointer'
                        letterSpacing
                        color='text1'
                        onClick={handleCopyEnsName}
                    >
                        {isSmallScreen
                            ? trimString(ensNameToDisplay, 18, 3, '...')
                            : ensNameToDisplay}
                        {/* {isSmallScreen
                            ? trimString(truncatedAccountAddress, 5, 3, '...')
                            : truncatedAccountAddress} */}
                    </FlexContainer>
                    <FlexContainer
                        fontWeight='300'
                        fontSize='body'
                        gap={8}
                        cursor='pointer'
                        onClick={handleCopyAddress}
                    >
                        {isSmallScreen
                            ? trimString(addressToDisplay ?? '', 7, 4, '...')
                            : trimString(addressToDisplay ?? '', 6, 4, '…')}
                        {addressToDisplay ? <FiCopy size={'12px'} /> : null}
                        {addressToDisplay ? (
                            <FiExternalLink
                                size={'12px'}
                                onClick={(e) => {
                                    handleOpenExplorer(
                                        resolvedAddress || (userAddress ?? ''),
                                    );
                                    e.stopPropagation();
                                }}
                            />
                        ) : null}
                    </FlexContainer>
                </FlexContainer>
            </FlexContainer>

            {showNFTPage &&
                NFTData &&
                NFTData.find(
                    (nftChainList) => nftChainList.chainId === chainId,
                ) &&
                NFTData.find((nftChainList) => nftChainList.chainId === chainId)
                    ?.userHasNFT && (
                    <NFTBannerAccount
                        setShowNFTPage={setShowNFTPage}
                        showNFTPage={showNFTPage}
                        NFTData={NFTData}
                        isfetchNftTriggered={isfetchNftTriggered}
                        setIsfetchNftTriggered={setIsfetchNftTriggered}
                        NFTFetchSettings={NFTFetchSettings}
                        setNFTFetchSettings={setNFTFetchSettings}
                        setNftTestWalletInput={setNftTestWalletInput}
                        nftTestWalletInput={nftTestWalletInput}
                        handleTestWalletChange={handleTestWalletChange}
                    />
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
                        onChange={(e) => setNftTestWalletInput(e.target.value)}
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
        </PortfolioBannerMainContainer>
    );
}
