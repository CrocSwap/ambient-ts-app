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
    UpdateProfileButton,
    ProfileSettingsContainer,
} from '../../../../styled/Components/Portfolio';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import NFTBannerAccount from './NFTBannerAccount';
import { TokenBalanceContext } from '../../../../contexts/TokenBalanceContext';
import { getAvatar } from '../../../Chat/ChatRenderUtils';
import useChatApi from '../../../Chat/Service/ChatApi';

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
        userAccountProfile,
        isfetchNftTriggered,
        setIsfetchNftTriggered,
        setUserAccountProfile,
    } = useContext(UserDataContext);

    const { NFTData } = useContext(TokenBalanceContext);

    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);
    const {
        chainData: { blockExplorer },
    } = useContext(CrocEnvContext);

    const ensNameToDisplay = ensName !== '' ? ensName : truncatedAccountAddress;

    const addressToDisplay = resolvedAddress
        ? resolvedAddress
        : ensNameAvailable
        ? truncatedAccountAddress
        : userAddress;

    const [_, copy] = useCopyToClipboard();

    const { getUserAvatar } = useChatApi();

    const [userAvatarImage, setUserAvatarImage] = useState(null);

    useEffect(() => {
        const fetchAvatar = async () => {
            if (userAddress) {
                const avatar = await getUserAvatar(userAddress);
                setUserAvatarImage(avatar);
                setUserAccountProfile(avatar);
            }
        };
        fetchAvatar();
    }, []);

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

    const updateProfile = NFTData && (
        <UpdateProfileButton
            onClick={(event: any) => {
                event.stopPropagation();
                setShowNFTPage(!showNFTPage);
            }}
        >
            Update Avatar
        </UpdateProfileButton>
    );

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
                <ProfileSettingsContainer placement={NFTData ? true : false}>
                    {userAddress &&
                        getAvatar(userAddress, userAccountProfile, 65)}
                    {/* {userAccountProfile ? (
                        <img
                            src={userAccountProfile}
                            style={{
                                width: '65px',
                                height: '65px',
                                borderRadius: '50%',
                            }}
                        ></img>
                    ) : (
                        <>{props.jazziconsToDisplay}</>
                    )} */}
                    {updateProfile}
                </ProfileSettingsContainer>

                <FlexContainer flexDirection='column' gap={4}>
                    <FlexContainer
                        fontWeight='300'
                        fontSize='header1'
                        cursor='pointer'
                        letterSpacing
                        color='text1'
                        onClick={handleCopyEnsName}
                    >
                        {ensNameToDisplay}
                    </FlexContainer>
                    <FlexContainer
                        fontWeight='300'
                        fontSize='body'
                        gap={8}
                        cursor='pointer'
                        onClick={handleCopyAddress}
                    >
                        {addressToDisplay}
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

            {showNFTPage && (
                <NFTBannerAccount
                    setShowNFTPage={setShowNFTPage}
                    showNFTPage={showNFTPage}
                    NFTData={NFTData}
                    isfetchNftTriggered={isfetchNftTriggered}
                    setIsfetchNftTriggered={setIsfetchNftTriggered}
                />
            )}
        </PortfolioBannerMainContainer>
    );
}
