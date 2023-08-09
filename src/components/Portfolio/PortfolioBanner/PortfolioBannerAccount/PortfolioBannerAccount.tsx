// import noAvatarImage from '../../../../assets/images/icons/avatar.svg';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import { useContext, useState } from 'react';
import { motion } from 'framer-motion';
interface IPortfolioBannerAccountPropsIF {
    ensName: string;
    resolvedAddress: string;
    truncatedAccountAddress: string;
    ensNameAvailable: boolean;
    jazziconsToDisplay: JSX.Element | null;
}
import styles from './PortfolioBannerAccount.module.css';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { useAppSelector } from '../../../../utils/hooks/reduxToolkit';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';

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
    const { addressCurrent: userAddress } = useAppSelector(
        (state) => state.userData,
    );

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
        <motion.main
            className={styles.main_container}
            animate={showAccountDetails ? 'open' : 'closed'}
        >
            <div
                className={styles.account_container}
                onClick={() => setShowAccountDetails(!showAccountDetails)}
            >
                {props.jazziconsToDisplay}

                <div className={styles.account_names}>
                    <span className={styles.name} onClick={handleCopyEnsName}>
                        {ensNameToDisplay}
                    </span>
                    <span className={styles.hash} onClick={handleCopyAddress}>
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
                    </span>
                </div>
            </div>
        </motion.main>
    );
}
