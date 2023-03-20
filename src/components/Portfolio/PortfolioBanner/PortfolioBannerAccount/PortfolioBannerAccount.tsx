// import noAvatarImage from '../../../../assets/images/icons/avatar.svg';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import SnackbarComponent from '../../../../components/Global/SnackbarComponent/SnackbarComponent';
import { useState } from 'react';
import { motion } from 'framer-motion';
import ambientLogo from '../../../../assets/images/logos/ambient_logo.png';
interface IPortfolioBannerAccountPropsIF {
    imageData: string[];
    ensName: string;
    resolvedAddress: string;
    activeAccount: string;
    truncatedAccountAddress: string;
    ensNameAvailable: boolean;
    connectedAccountActive: boolean;
    blockiesToDisplay: JSX.Element | null;
    chainData: ChainSpec;
}
import styles from './PortfolioBannerAccount.module.css';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { ChainSpec } from '@crocswap-libs/sdk';

// const variants = {
//     open: {
//         width: '500px',
//         height: 'auto',
//         borderRadius: '20px',
//         background: 'var(--dark3)',
//         boxShadow: '0px 45px 20px rgba(0, 0, 0, 0.9)',

//     },
//     closed: {
//         width: 'auto',
//         height: '56px',
//         borderRadius: '99px',
//         background: '',

//     },
// };
export default function PortfolioBannerAccount(
    props: IPortfolioBannerAccountPropsIF,
) {
    const [showAccountDetails, setShowAccountDetails] = useState(false);

    const {
        imageData,
        ensName,
        resolvedAddress,
        activeAccount,
        truncatedAccountAddress,
        ensNameAvailable,
        chainData,
    } = props;

    const blockExplorer = chainData.blockExplorer;

    const ensNameToDisplay = ensNameAvailable
        ? ensName
        : truncatedAccountAddress;

    const addressToDisplay = resolvedAddress
        ? resolvedAddress
        : ensNameAvailable
        ? truncatedAccountAddress
        : activeAccount;

    const [openSnackbar, setOpenSnackbar] = useState(false);
    // eslint-disable-next-line
    const [value, copy] = useCopyToClipboard();
    const [copiedData, setCopiedData] = useState('');

    function handleCopyEnsName() {
        copy(
            ensNameAvailable
                ? ensName
                : resolvedAddress
                ? resolvedAddress
                : activeAccount,
        );
        setCopiedData(
            ensNameAvailable
                ? ensName
                : resolvedAddress
                ? resolvedAddress
                : activeAccount,
        );

        setOpenSnackbar(true);
    }
    function handleCopyAddress() {
        copy(resolvedAddress ? resolvedAddress : activeAccount);
        setCopiedData(resolvedAddress ? resolvedAddress : activeAccount);

        setOpenSnackbar(true);
    }

    const snackbarContent = (
        <SnackbarComponent
            severity='info'
            setOpenSnackbar={setOpenSnackbar}
            openSnackbar={openSnackbar}
        >
            {copiedData} copied
        </SnackbarComponent>
    );

    const iconVariants = {
        open: {
            width: '56px',
            height: '56px',
            // borderRadius: '12px',
        },
        closed: {
            width: '56px',
            height: '56px',
            // borderRadius: '50%',
        },
    };

    const ambientLogoDisplay = (
        <img src={ambientLogo} alt='' className={styles.ambi_logo} />
    );

    function handleOpenExplorer(address: string) {
        if (address && blockExplorer) {
            const explorerUrl = `${blockExplorer}address/${address}`;
            window.open(explorerUrl);
        }
    }
    function handleOpenMainnetExplorer(address: string) {
        if (address) {
            const explorerUrl = `https://etherscan.io/address/${address}`;
            window.open(explorerUrl);
        }
    }

    return (
        <motion.main
            // style={{padding: showAccountDetails ? '24px' : '8px 16px'}}
            className={styles.main_container}
            animate={showAccountDetails ? 'open' : 'closed'}
            // variants={variants}

            // style={{ background: showAccountDetails ? 'black' : '' }}
        >
            <div
                className={styles.account_container}
                onClick={() => setShowAccountDetails(!showAccountDetails)}
            >
                {imageData[0] ? (
                    <motion.div
                        className={styles.avatar_image}
                        animate={showAccountDetails ? 'open' : 'closed'}
                        variants={iconVariants}
                    >
                        <img src={imageData[0]} alt='avatar' />
                    </motion.div>
                ) : (
                    ambientLogoDisplay
                )}
                <div className={styles.account_names}>
                    <span className={styles.name} onClick={handleCopyEnsName}>
                        {ensNameToDisplay}
                        {ensNameToDisplay ? <FiCopy size={'12px'} /> : null}
                        {ensNameToDisplay ? (
                            <FiExternalLink
                                size={'12px'}
                                onClick={(e) => {
                                    if (chainData.isTestNet) {
                                        // ENS lookup not supported on Görli etherscan
                                        handleOpenMainnetExplorer(ensName);
                                    } else {
                                        handleOpenExplorer(ensName);
                                    }

                                    e.stopPropagation();
                                }}
                            />
                        ) : null}
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
            {/* {showAccountDetails && (
                <FollowDisplay
                    exampleFollowers={exampleFollowers}
                    exampleFollowing={exampleFollowing}
                    showAccountDetails={showAccountDetails}
                    connectedAccountActive={connectedAccountActive}
                />
            )} */}
            {snackbarContent}
        </motion.main>
    );
}
