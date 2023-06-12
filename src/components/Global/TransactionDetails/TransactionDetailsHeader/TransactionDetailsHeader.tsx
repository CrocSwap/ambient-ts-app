import styles from './TransactionDetailsHeader.module.css';
import { Dispatch, SetStateAction, useContext } from 'react';
import ambientLogo from '../../../../assets/images/logos/ambient_logo.svg';
import ambientLogoText from '../../../../assets/images/logos/logo_text.png';
import { FiCopy } from 'react-icons/fi';
import { CgClose } from 'react-icons/cg';
import IconWithTooltip from '../../IconWithTooltip/IconWithTooltip';
import { AppStateContext } from '../../../../contexts/AppStateContext';
interface TransactionDetailsHeaderPropsIF {
    copyTransactionDetailsToClipboard: () => Promise<void>;
    showSettings: boolean;
    setShowSettings: Dispatch<SetStateAction<boolean>>;
    showShareComponent: boolean;
    setShowShareComponent: Dispatch<SetStateAction<boolean>>;
    handleCopyAddress(): void;
}
export default function TransactionDetailsHeader(
    props: TransactionDetailsHeaderPropsIF,
) {
    const {
        handleCopyAddress,
        copyTransactionDetailsToClipboard,
        showShareComponent,
        setShowShareComponent,
    } = props;

    const {
        globalModal: { close: onClose },
    } = useContext(AppStateContext);

    const copyTxHashIconWithTooltip = (
        <IconWithTooltip
            title='Copy transaction hash to clipboard'
            placement='bottom'
        >
            <div onClick={handleCopyAddress}>
                <FiCopy size={25} color='var(--text3)' />
            </div>
        </IconWithTooltip>
    );

    const copyImageIconWithTooltip = (
        <IconWithTooltip title='Copy shareable image' placement='bottom'>
            <div onClick={copyTransactionDetailsToClipboard}>
                <FiCopy size={25} color='var(--text3)' />
            </div>
        </IconWithTooltip>
    );

    return (
        <div className={styles.container}>
            <section className={styles.logo_container}>
                <img src={ambientLogo} alt='ambient' width='35px' />
                <img src={ambientLogoText} alt='ambient' width='176px' />
            </section>

            <section className={styles.settings_control}>
                {!showShareComponent ? copyTxHashIconWithTooltip : null}
                {showShareComponent ? copyImageIconWithTooltip : null}
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
