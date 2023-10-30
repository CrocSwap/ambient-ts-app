// import noAvatarImage from '../../../../assets/images/icons/avatar.svg';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import { useContext, useState } from 'react';
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

export default function PortfolioBannerAccount(
    props: IPortfolioBannerAccountPropsIF,
) {
    const [showAccountDetails, setShowAccountDetails] = useState(false);

    const {
        ensName,
        resolvedAddress,
        truncatedAccountAddress,
        ensNameAvailable,
    } = props;
    const { userAddress: addressCurrent } = useContext(UserDataContext);

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
        : addressCurrent;

    const [_, copy] = useCopyToClipboard();

    function handleCopyEnsName() {
        copy(
            ensNameAvailable
                ? ensName
                : resolvedAddress
                ? resolvedAddress
                : addressCurrent ?? '',
        );
        const copiedData = ensNameAvailable
            ? ensName
            : resolvedAddress
            ? resolvedAddress
            : addressCurrent;

        openSnackbar(`${copiedData} copied`, 'info');
    }
    function handleCopyAddress() {
        copy(resolvedAddress ? resolvedAddress : addressCurrent ?? '');
        const copiedData = resolvedAddress ? resolvedAddress : addressCurrent;

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
        >
            <FlexContainer
                alignItems='flex-end'
                zIndex={1}
                gap={22}
                onClick={() => setShowAccountDetails(!showAccountDetails)}
            >
                {props.jazziconsToDisplay}

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
                                        resolvedAddress ||
                                            (addressCurrent ?? ''),
                                    );
                                    e.stopPropagation();
                                }}
                            />
                        ) : null}
                    </FlexContainer>
                </FlexContainer>
            </FlexContainer>
        </PortfolioBannerMainContainer>
    );
}
