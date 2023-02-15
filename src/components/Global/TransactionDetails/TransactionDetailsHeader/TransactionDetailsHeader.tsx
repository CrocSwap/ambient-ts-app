import styles from './TransactionDetailsHeader.module.css';
import { Dispatch, SetStateAction, useState } from 'react';
import ambientLogo from '../../../../assets/images/logos/ambient_logo.svg';
import { FiCopy, FiDownload } from 'react-icons/fi';
import { CgClose } from 'react-icons/cg';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import { TransactionIF } from '../../../../utils/interfaces/TransactionIF';
import IconWithTooltip from '../../IconWithTooltip/IconWithTooltip';
// import SnackbarComponent from '../../../../components/Global/SnackbarComponent/SnackbarComponent';
interface TransactionDetailsHeaderPropsIF {
    onClose: () => void;
    downloadAsImage: () => void;
    showSettings: boolean;
    setShowSettings: Dispatch<SetStateAction<boolean>>;
    showShareComponent: boolean;
    setShowShareComponent: Dispatch<SetStateAction<boolean>>;
    tx: TransactionIF;
}
export default function TransactionDetailsHeader(props: TransactionDetailsHeaderPropsIF) {
    const { tx, onClose, downloadAsImage, showShareComponent, setShowShareComponent } = props;
    // eslint-disable-next-line
    const [openSnackbar, setOpenSnackbar] = useState(false);
    // eslint-disable-next-line
    const [value, copy] = useCopyToClipboard();

    const phIcon = <FiCopy size={25} color='var(--text-grey-dark)' style={{ opacity: '0' }} />;

    const copyIconWithTooltip = (
        <IconWithTooltip title='Copy transaction hash to clipboard' placement='bottom'>
            <div onClick={handleCopyAddress}>
                <FiCopy size={25} color='var(--text-grey-dark)' />
            </div>
        </IconWithTooltip>
    );

    const downloadIconWithTooltip = (
        <IconWithTooltip title='Download shareable image' placement='bottom'>
            <div onClick={downloadAsImage}>
                <FiDownload size={25} color='var(--text-grey-dark)' />
            </div>
        </IconWithTooltip>
    );

    function handleCopyAddress() {
        const txHash = tx.tx;
        copy(txHash);
        setOpenSnackbar(true);
    }

    // const snackbarContent = (
    //     <SnackbarComponent
    //         severity='info'
    //         setOpenSnackbar={setOpenSnackbar}
    //         openSnackbar={openSnackbar}
    //     >
    //         {value} copied
    //     </SnackbarComponent>
    // );

    return (
        <div className={styles.container}>
            <section className={styles.logo_container}>
                <img src={ambientLogo} alt='ambient' width='35px' />
                <span className={styles.ambient_title}>ambient</span>
            </section>

            <section className={styles.settings_control}>
                <button
                    className={styles.info_button}
                    onClick={() => setShowShareComponent(!showShareComponent)}
                >
                    {showShareComponent ? 'Details' : 'Share'}
                </button>

                {showShareComponent ? copyIconWithTooltip : phIcon}

                {showShareComponent ? downloadIconWithTooltip : phIcon}

                <div onClick={onClose}>
                    <CgClose size={28} color='var(--text-grey-dark)' />
                </div>
            </section>
        </div>
    );
}
