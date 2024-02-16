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
import { PortfolioBannerMainContainer } from '../../../../styled/Components/Portfolio';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import NFTBannerAccount from './NFTBannerAccount';

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
    const { userAddress, userAccountProfile } = useContext(UserDataContext);

    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);
    const {
        chainData: { blockExplorer },
    } = useContext(CrocEnvContext);

    const ensNameToDisplay = ensNameAvailable
        ? ensName
        : truncatedAccountAddress;

    const addressToDisplay = resolvedAddress
        ? resolvedAddress
        : ensNameAvailable
        ? truncatedAccountAddress
        : userAddress;

    const [_, copy] = useCopyToClipboard();

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

    return (
        <PortfolioBannerMainContainer
            animate={showAccountDetails ? 'open' : 'closed'}
            onClick={() => setShowNFTPage(!showNFTPage)}
        >
            <FlexContainer
                alignItems='flex-end'
                zIndex={1}
                gap={22}
                onClick={() => setShowAccountDetails(!showAccountDetails)}
            >
                {userAccountProfile ? (
                    <img
                        src={userAccountProfile}
                        onClick={(event) => {
                            event.stopPropagation();
                            setShowNFTPage(!showNFTPage);
                        }}
                        style={{
                            width: '70px',
                            height: '70px',
                            borderRadius: '50%',
                        }}
                    ></img>
                ) : (
                    <div
                        onClick={(event) => {
                            event.stopPropagation();
                            setShowNFTPage(!showNFTPage);
                        }}
                    >
                        {props.jazziconsToDisplay}
                    </div>
                )}

                <FlexContainer flexDirection='column'>
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
                />
            )}
        </PortfolioBannerMainContainer>
    );
}
