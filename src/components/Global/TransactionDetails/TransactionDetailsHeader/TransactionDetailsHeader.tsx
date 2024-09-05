import styles from './TransactionDetailsHeader.module.css';
import { Dispatch, SetStateAction } from 'react';
import logo from '../../../../assets/images/logos/logo_mark.svg';
import logoText from '../../../../assets/images/logos/logo_text.png';
import { FiCopy } from 'react-icons/fi';
import { CgClose } from 'react-icons/cg';
import IconWithTooltip from '../../IconWithTooltip/IconWithTooltip';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';

interface TransactionDetailsHeaderPropsIF {
    copyTransactionDetailsToClipboard: () => Promise<void>;
    showSettings: boolean;
    setShowSettings: Dispatch<SetStateAction<boolean>>;
    showShareComponent: boolean;
    setShowShareComponent: Dispatch<SetStateAction<boolean>>;
    handleCopyAddress(): void;
    onClose: () => void;
}

export default function TransactionDetailsHeader(
    props: TransactionDetailsHeaderPropsIF,
) {
    const {
        handleCopyAddress,
        copyTransactionDetailsToClipboard,
        showShareComponent,
        setShowShareComponent,
        onClose,
    } = props;

    const isMobile = useMediaQuery('(max-width: 800px)');

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
                <img src={logo} alt='ambient' className={styles.logo} />
                <img
                    src={logoText}
                    alt='ambient'
                    className={styles.logo_text}
                />
            </section>

            {isMobile ? (
                <section className={styles.settings_control_mobile}>
                    <div className={styles.mobile_close_header}>
                        {!showShareComponent ? copyTxHashIconWithTooltip : null}
                        {showShareComponent ? copyImageIconWithTooltip : null}
                        <div onClick={onClose}>
                            <CgClose size={28} color='var(--text3)' />
                        </div>
                    </div>

                    <button
                        className={styles.info_button}
                        onClick={() =>
                            setShowShareComponent(!showShareComponent)
                        }
                    >
                        {showShareComponent ? 'Details' : 'Share'}
                    </button>
                </section>
            ) : (
                <section className={styles.settings_control}>
                    {!showShareComponent ? copyTxHashIconWithTooltip : null}
                    {showShareComponent ? copyImageIconWithTooltip : null}
                    <button
                        className={styles.info_button}
                        onClick={() =>
                            setShowShareComponent(!showShareComponent)
                        }
                    >
                        {showShareComponent ? 'Details' : 'Share'}
                    </button>

                    <div onClick={onClose}>
                        <CgClose size={28} color='var(--text3)' />
                    </div>
                </section>
            )}
        </div>
    );
}
