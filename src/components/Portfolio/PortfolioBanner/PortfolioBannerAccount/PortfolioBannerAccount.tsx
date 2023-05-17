// import noAvatarImage from '../../../../assets/images/icons/avatar.svg';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import { useContext, useState } from 'react';
import { motion } from 'framer-motion';
// import ambientLogo from '../../../../assets/images/logos/ambient_logo.png';
interface IPortfolioBannerAccountPropsIF {
    ensName: string;
    resolvedAddress: string;
    activeAccount: string;
    truncatedAccountAddress: string;
    ensNameAvailable: boolean;
    connectedAccountActive: boolean;
    jazziconsToDisplay: JSX.Element | null;
    chainData: ChainSpec;
}
import styles from './PortfolioBannerAccount.module.css';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { ChainSpec } from '@crocswap-libs/sdk';
import { AppStateContext } from '../../../../contexts/AppStateContext';

export default function PortfolioBannerAccount(
    props: IPortfolioBannerAccountPropsIF,
) {
    const [showAccountDetails, setShowAccountDetails] = useState(false);

    const {
        ensName,
        resolvedAddress,
        activeAccount,
        truncatedAccountAddress,
        ensNameAvailable,
        chainData,
    } = props;

    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

    const blockExplorer = chainData.blockExplorer;

    const ensNameToDisplay = ensNameAvailable
        ? ensName
        : truncatedAccountAddress;

    const addressToDisplay = resolvedAddress
        ? resolvedAddress
        : ensNameAvailable
        ? truncatedAccountAddress
        : activeAccount;

    const [_, copy] = useCopyToClipboard();

    function handleCopyEnsName() {
        copy(
            ensNameAvailable
                ? ensName
                : resolvedAddress
                ? resolvedAddress
                : activeAccount,
        );
        const copiedData = ensNameAvailable
            ? ensName
            : resolvedAddress
            ? resolvedAddress
            : activeAccount;

        openSnackbar(`${copiedData} copied`, 'info');
    }
    function handleCopyAddress() {
        copy(resolvedAddress ? resolvedAddress : activeAccount);
        const copiedData = resolvedAddress ? resolvedAddress : activeAccount;

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
                                        resolvedAddress || activeAccount,
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
