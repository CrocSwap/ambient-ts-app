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
import { AppStateContext, AppStateContextIF } from '../../../../contexts/AppStateContext';
import { CrocEnvContext, CrocEnvContextIF } from '../../../../contexts/CrocEnvContext';
import { TokenBalanceContext, TokenBalanceContextIF } from '../../../../contexts/TokenBalanceContext';
import { UserDataContext, UserDataContextIF } from '../../../../contexts/UserDataContext';
import styles from './PortfolioBannerAccount.module.css';

import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
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
    setShowTabsAndNotExchange: Dispatch<SetStateAction<boolean>>
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
    } = useContext<UserDataContextIF>(UserDataContext);

    const { NFTData } = useContext<TokenBalanceContextIF>(TokenBalanceContext);

    const {
        snackbar: { open: openSnackbar },
    } = useContext<AppStateContextIF>(AppStateContext);

    const {
        chainData: { blockExplorer },
    } = useContext<CrocEnvContextIF>(CrocEnvContext);

    const isSmallScreen: boolean = useMediaQuery('(max-width: 768px)');

    const [showAccountDetails, setShowAccountDetails] = useState<boolean>(false);

    const ensNameToDisplay: string = ensName !== '' ? ensName : truncatedAccountAddress;

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
                  : userAddress ?? '',
        );
        const copiedData = ensNameAvailable
            ? ensName
            : resolvedAddress
              ? resolvedAddress
              : userAddress;

        openSnackbar(`${copiedData} copied`, 'info');
    }

    function handleCopyAddress(): void {
        copy(resolvedAddress ? resolvedAddress : userAddress ?? '');
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
    const [isWalletPanelActive, setIsWalletPanelActive] = useState<boolean>(false);

    // functionality to show panel for NFT test fetch
    useEffect(() => {
        function openWalletAddressPanel(e: KeyboardEvent): void {
            if (e.code === 'KeyQ' && e.altKey) {
                setIsWalletPanelActive((prev) => !prev);
                document.removeEventListener('keydown', openWalletAddressPanel);
            }
        }
        document.body.addEventListener('keydown', openWalletAddressPanel);
        return document.body.removeEventListener('keydown', openWalletAddressPanel);
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
                    </div>
                </div>

                {isSmallScreen && connectedAccountActive && (
                    <button
                        className={styles.deposit_button}
                        onClick={() =>
                            setShowTabsAndNotExchange(!showTabsAndNotExchange)
                        }
                    >
                        {showTabsAndNotExchange
                            ? 'Transactions'
                            : 'Deposit/Withdraw'}
                    </button>
                )}
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
