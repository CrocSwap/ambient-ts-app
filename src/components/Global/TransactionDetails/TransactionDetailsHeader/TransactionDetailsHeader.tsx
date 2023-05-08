import styles from './TransactionDetailsHeader.module.css';
import { Dispatch, SetStateAction } from 'react';
import ambientLogo from '../../../../assets/images/logos/ambient_logo.svg';
import { FiCopy } from 'react-icons/fi';
import { CgClose } from 'react-icons/cg';
import { TransactionIF } from '../../../../utils/interfaces/TransactionIF';
import IconWithTooltip from '../../IconWithTooltip/IconWithTooltip';
interface TransactionDetailsHeaderPropsIF {
    onClose: () => void;
    downloadAsImage: () => void;
    showSettings: boolean;
    setShowSettings: Dispatch<SetStateAction<boolean>>;
    showShareComponent: boolean;
    setShowShareComponent: Dispatch<SetStateAction<boolean>>;
    tx: TransactionIF;
    handleCopyAddress(): void;
}
export default function TransactionDetailsHeader(
    props: TransactionDetailsHeaderPropsIF,
) {
    const {
        // tx,
        handleCopyAddress,
        onClose,
        // downloadAsImage,
        showShareComponent,
        setShowShareComponent,
    } = props;

    const copyIconWithTooltip = (
        <IconWithTooltip
            title='Copy transaction hash to clipboard'
            placement='bottom'
        >
            <div onClick={handleCopyAddress}>
                <FiCopy size={25} color='var(--text3)' />
            </div>
        </IconWithTooltip>
    );

    // TODO: fix download
    // const downloadIconWithTooltip = (
    //     <IconWithTooltip title='Download shareable image' placement='bottom'>
    //         <div onClick={downloadAsImage}>
    //             <FiDownload size={25} color='var(--text3)' />
    //         </div>
    //     </IconWithTooltip>
    // );

    return (
        <div className={styles.container}>
            <section className={styles.logo_container}>
                <img src={ambientLogo} alt='ambient' width='35px' />
                <span className={styles.ambient_title}>ambient</span>
            </section>

            <section className={styles.settings_control}>
                {showShareComponent && copyIconWithTooltip}
                {/* {showShareComponent && downloadIconWithTooltip} */}
                <button
                    className={styles.info_button}
                    onClick={() => setShowShareComponent(!showShareComponent)}
                >
                    {showShareComponent ? 'Details' : 'Share'}
                </button>
                <div onClick={onClose}>
                    <CgClose size={28} color='var(--text3)' />
                </div>
            </section>
        </div>
    );
}
