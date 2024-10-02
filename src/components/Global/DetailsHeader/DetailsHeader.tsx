import { Dispatch, SetStateAction } from 'react';
import { FiCopy } from 'react-icons/fi';
import { CgClose } from 'react-icons/cg';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';
import styles from './DetailsHeader.module.css'
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import logo from '../../../assets/images/logos/logo_mark.svg';
import logoText from '../../../assets/images/logos/logo_text.png';
interface DetailsHeaderPropsIF {
    onClose: () => void;
    handleCopyAction: () => void; // e.g., copy position ID, transaction hash, etc.
    copyToClipboard: () => Promise<void>; // e.g., copy details to clipboard
    showShareComponent: boolean;
    setShowShareComponent: Dispatch<SetStateAction<boolean>>;
    tooltipCopyAction: string; // tooltip message for copy action (e.g., "Copy position slot ID")
    tooltipCopyImage: string; // tooltip message for copying image (e.g., "Copy shareable image")
    isMobileLayout?: boolean; // optional prop to adjust layout for mobile (used in TransactionDetailsHeader)
}

export default function DetailsHeader(props: DetailsHeaderPropsIF) {
    const {
        onClose,
        handleCopyAction,
        copyToClipboard,
        showShareComponent,
        setShowShareComponent,
        tooltipCopyAction,
        tooltipCopyImage,
        isMobileLayout = false, // default to false if not provided
    } = props;

    const isMobile = useMediaQuery('(max-width: 800px)') || isMobileLayout;

    const copyActionIconWithTooltip = (
        <IconWithTooltip title={tooltipCopyAction} placement='bottom'>
            <div onClick={handleCopyAction}>
                <FiCopy size={25} color='var(--text3)' />
            </div>
        </IconWithTooltip>
    );

    const copyImageIconWithTooltip = (
        <IconWithTooltip title={tooltipCopyImage} placement='bottom'>
            <div onClick={copyToClipboard}>
                <FiCopy size={25} color='var(--text3)' />
            </div>
        </IconWithTooltip>
    );

    return (
        <div className={styles.container}>
            <section className={styles.logo_container}>
                <img src={logo} alt='ambient' className={styles.logo} />
                <img src={logoText} alt='ambient' className={styles.logo_text} />
            </section>

            {isMobile ? (
                <section className={styles.settings_control_mobile}>
                    <div className={styles.mobile_close_header}>
                        {!showShareComponent ? copyActionIconWithTooltip : null}
                        {showShareComponent ? copyImageIconWithTooltip : null}
                        <div onClick={onClose}>
                            <CgClose size={28} color='var(--text3)' />
                        </div>
                    </div>
                    <button
                        className={styles.info_button}
                        onClick={() => setShowShareComponent(!showShareComponent)}
                    >
                        {showShareComponent ? 'Details' : 'Share'}
                    </button>
                </section>
            ) : (
                <section className={styles.settings_control}>
                    {!showShareComponent ? copyActionIconWithTooltip : null}
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
            )}
        </div>
    );
}
