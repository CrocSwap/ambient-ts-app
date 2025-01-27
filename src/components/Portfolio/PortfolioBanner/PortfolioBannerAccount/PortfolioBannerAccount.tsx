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
import { TokenBalanceContext } from '../../../../contexts/TokenBalanceContext';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import styles from './PortfolioBannerAccount.module.css';

import { useNavigate } from 'react-router-dom';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import { useMediaQuery } from '../../../../utils/hooks/useMediaQuery';
import { getAvatarForProfilePage } from '../../../Chat/ChatRenderUtils';
import useChatApi from '../../../Chat/Service/ChatApi';

interface propsIF {
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

export default function PortfolioBannerAccount(props: propsIF) {
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
        isUserConnected,
        disconnectUser,
        resolvedAddressFromContext,
    } = useContext(UserDataContext);

    const { NFTData } = useContext(TokenBalanceContext);

    const {
        activeNetwork: { blockExplorer },
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

    const navigate = useNavigate();

    const isSmallScreen: boolean = useMediaQuery('(max-width: 768px)');

    const [showAccountDetails, setShowAccountDetails] =
        useState<boolean>(false);

    const ensNameToDisplay: string =
        ensName !== '' ? ensName : truncatedAccountAddress;

    const addressToDisplay: string | undefined = resolvedAddress
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

    function handleCopyEnsName(): void {
        copy(
            ensNameAvailable
                ? ensName
                : resolvedAddress
                  ? resolvedAddress
                  : (userAddress ?? ''),
        );
        const copiedData = ensNameAvailable
            ? ensName
            : resolvedAddress
              ? resolvedAddress
              : userAddress;

        openSnackbar(`${copiedData} copied`, 'info');
    }

    function handleCopyAddress(): void {
        copy(resolvedAddress ? resolvedAddress : (userAddress ?? ''));
        const copiedData = resolvedAddress ? resolvedAddress : userAddress;
        openSnackbar(`${copiedData} copied`, 'info');
    }

    function handleOpenExplorer(address: string): void {
        if (address && blockExplorer) {
            const explorerUrl = `${blockExplorer}address/${address}`;
            window.open(explorerUrl);
        }
    }

    // Nft Fetch For Test Wallet
    const [isWalletPanelActive, setIsWalletPanelActive] =
        useState<boolean>(false);

    // functionality to show panel for NFT test fetch
    useEffect(() => {
        function openWalletAddressPanel(e: KeyboardEvent): void {
            if (e.code === 'KeyQ' && e.altKey) {
                setIsWalletPanelActive((prev) => !prev);
                document.removeEventListener('keydown', openWalletAddressPanel);
            }
        }
        document.body.addEventListener('keydown', openWalletAddressPanel);
        return document.body.removeEventListener(
            'keydown',
            openWalletAddressPanel,
        );
    }, []);

    return (
        <div className={styles.portfolio_banner_account}>
            <div
                className={styles.user_facing_content}
                onClick={() => setShowAccountDetails(!showAccountDetails)}
            >
                <div
                    className={styles.jazzicon}
                    style={{
                        transform: NFTData
                            ? 'transform: translate(0%, 23%)'
                            : '',
                    }}
                    onClick={() => {
                        !(
                            resolvedAddress !== undefined &&
                            resolvedAddress.length > 0 &&
                            !connectedAccountActive
                        ) && setShowNFTPage(!showNFTPage);
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
                <div className={styles.wallet_info}>
                    <h3
                        className={styles.address_or_ens}
                        onClick={handleCopyEnsName}
                    >
                        {isSmallScreen
                            ? trimString(ensNameToDisplay, 18, 3, '...')
                            : ensNameToDisplay}
                    </h3>
                    <div
                        className={styles.address_detail}
                        onClick={handleCopyAddress}
                    >
                        {addressToDisplay && addressToDisplay.length > 8
                            ? trimString(addressToDisplay, 5, 3)
                            : addressToDisplay}
                        {addressToDisplay && <FiCopy size={'12px'} />}
                        {addressToDisplay && (
                            <FiExternalLink
                                size={'12px'}
                                onClick={(e) => {
                                    handleOpenExplorer(
                                        resolvedAddress || (userAddress ?? ''),
                                    );
                                    e.stopPropagation();
                                }}
                            />
                        )}
                    </div>
                </div>
                {
                    // differential view for small screens
                    // some items only appear when viewing your own page
                    useMediaQuery('(max-width: 567px)') && (
                        <div className={styles.button_bank}>
                            <div>
                                <button
                                    className={styles.dark_button}
                                    onClick={() => {
                                        const linkToNavigateTo: string =
                                            ensName || userAddress
                                                ? `/${ensName || userAddress}/xp`
                                                : resolvedAddressFromContext
                                                  ? `/${resolvedAddressFromContext}/xp`
                                                  : `/${userAddress}/xp`;
                                        navigate(linkToNavigateTo);
                                    }}
                                >
                                    Points
                                </button>
                                {isUserConnected && (
                                    <button
                                        className={styles.logout_button}
                                        onClick={() => disconnectUser()}
                                    >
                                        Log Out
                                    </button>
                                )}
                            </div>
                            {isUserConnected && (
                                <button
                                    className={styles.dark_button}
                                    onClick={() =>
                                        setShowTabsAndNotExchange(
                                            !showTabsAndNotExchange,
                                        )
                                    }
                                >
                                    Deposit / Withdraw
                                </button>
                            )}
                        </div>
                    )
                }
            </div>

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
