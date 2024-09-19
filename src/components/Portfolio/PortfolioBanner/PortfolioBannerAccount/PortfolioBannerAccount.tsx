// import noAvatarImage from '../../../../assets/images/icons/avatar.svg';
import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from 'react';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { MdOutlineCloudDownload } from 'react-icons/md';
import { trimString } from '../../../../ambient-utils/dataLayer';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { TokenBalanceContext } from '../../../../contexts/TokenBalanceContext';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { FlexContainer } from '../../../../styled/Common';
import styles from './PortfolioBannerAccount.module.css';

import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import { getAvatarForProfilePage } from '../../../Chat/ChatRenderUtils';
import useChatApi from '../../../Chat/Service/ChatApi';

interface IPortfolioBannerAccountPropsIF {
    ensName: string;
    resolvedAddress: string;
    truncatedAccountAddress: string;
    ensNameAvailable: boolean;
    jazziconsToDisplay: JSX.Element | null;
    connectedAccountActive: boolean;
    showTabsAndNotExchange: boolean;
    setShowTabsAndNotExchange: Dispatch<SetStateAction<boolean>>;

    nftTestWalletInput: string;
    setNftTestWalletInput: Dispatch<SetStateAction<string>>;

    showNFTPage: boolean;
    setShowNFTPage: Dispatch<SetStateAction<boolean>>;
    // eslint-disable-next-line 
    handleTestWalletChange: any;
}

export default function PortfolioBannerAccount(
    props: IPortfolioBannerAccountPropsIF,
) {
    const [showAccountDetails, setShowAccountDetails] = useState(false);

    const {
        ensName,
        resolvedAddress,
        truncatedAccountAddress,
        ensNameAvailable,
        connectedAccountActive,
        showTabsAndNotExchange,
        setShowTabsAndNotExchange,

        showNFTPage,
        setShowNFTPage,

        nftTestWalletInput,
        setNftTestWalletInput,

        handleTestWalletChange,
    } = props;

    const {
        userAddress,
        userProfileNFT,

        setUserProfileNFT,
        setUserThumbnailNFT,
    } = useContext(UserDataContext);

    const { NFTData } = useContext(TokenBalanceContext);

    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);
    const {
        // chainData: { blockExplorer, chainId },
        chainData: { blockExplorer },
    } = useContext(CrocEnvContext);
    const isSmallScreen = useMediaQuery('(max-width: 768px)');

    const ensNameToDisplay = ensName !== '' ? ensName : truncatedAccountAddress;

    const addressToDisplay = resolvedAddress
        ? resolvedAddress
        : ensNameAvailable
          ? truncatedAccountAddress
          : userAddress;

    const [_, copy] = useCopyToClipboard();

    const { getUserAvatar } = useChatApi();

    const fetchAvatar = async () => {
        if (resolvedAddress || userAddress) {
            const avatar = await getUserAvatar(
                resolvedAddress
                    ? resolvedAddress
                    : userAddress
                      ? userAddress
                      : '',
            );
            setUserProfileNFT(avatar.avatarImage);
            setUserThumbnailNFT(avatar.avatarThumbnail);
        }
    };

    useEffect(() => {
        fetchAvatar();
    }, [resolvedAddress, userAddress]);

    useEffect(() => {
        setShowNFTPage(false);
    }, [resolvedAddress]);

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

    return (
        <div
            className={styles.portfolio_banner_main_container}

            // animate={showAccountDetails ? 'open' : 'closed'}
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
                            resolvedAddress.length > 0 &&
                            !connectedAccountActive
                        ) && setShowNFTPage(!showNFTPage);
                    }}
                >
                    <div
                        className={styles.portfolio_settings_container}
                        style={{
                            transform: NFTData
                                ? 'transform: translate(0%, 23%)'
                                : '',
                        }}
                    >
                        {(resolvedAddress || userAddress) &&
                            getAvatarForProfilePage(
                                resolvedAddress
                                    ? resolvedAddress
                                    : userAddress
                                      ? userAddress
                                      : '',
                                userProfileNFT,
                                65,
                                resolvedAddress !== undefined &&
                                    resolvedAddress.length > 0 &&
                                    !connectedAccountActive
                                    ? false
                                    : true,
                            )}
                    </div>
                </span>

                <FlexContainer flexDirection='column' gap={4}>
                    <FlexContainer
                        fontWeight='300'
                        fontSize={isSmallScreen ? 'body' : 'header1'}
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

                {isSmallScreen && connectedAccountActive && (
                    <button
                        onClick={() =>
                            setShowTabsAndNotExchange(!showTabsAndNotExchange)
                        }
                        className={styles.deposit_button}
                    >
                        {showTabsAndNotExchange
                            ? 'Transactions'
                            : 'Deposit/Withdraw'}
                    </button>
                )}
            </FlexContainer>

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
        </div>
    );
}
