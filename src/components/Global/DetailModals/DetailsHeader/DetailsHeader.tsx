import { Dispatch, SetStateAction } from 'react';
import { CgClose } from 'react-icons/cg';
import { LuCopy, LuShare2 } from 'react-icons/lu';
import { RiScreenshot2Fill } from 'react-icons/ri';
import { TbListDetails } from 'react-icons/tb';
import logo from '../../../../assets/images/logos/logo_mark.svg';
import logoText from '../../../../assets/images/logos/logo_text.png';
import { useMediaQuery } from '../../../../utils/hooks/useMediaQuery';
import IconWithTooltip from '../../IconWithTooltip/IconWithTooltip';
import styles from './DetailsHeader.module.css';
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
    } = props;

    const isMobile = useMediaQuery('(max-width: 600px)');

    const copyActionIconWithTooltip = (
        <IconWithTooltip title={tooltipCopyAction} placement='bottom'>
            <div onClick={handleCopyAction}>
                <LuCopy size={25} color='var(--text3)' />
            </div>
        </IconWithTooltip>
    );

    const copyImageIconWithTooltip = (
        <IconWithTooltip title={tooltipCopyImage} placement='bottom'>
            <div onClick={copyToClipboard}>
                <RiScreenshot2Fill size={25} color='var(--text3)' />
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

            {/* <div>something here</div> */}

            <section className={styles.settings_control}>
                {!showShareComponent ? copyActionIconWithTooltip : null}
                {showShareComponent ? copyImageIconWithTooltip : null}

                <button
                    className={styles.info_button}
                    onClick={() => setShowShareComponent(!showShareComponent)}
                >
                    {showShareComponent ? (
                        isMobile ? (
                            <TbListDetails size={25} color='var(--text3)' />
                        ) : (
                            'Details'
                        )
                    ) : isMobile ? (
                        <LuShare2 size={25} color='var(--text3)' />
                    ) : (
                        'Share'
                    )}
                </button>
                <div onClick={onClose}>
                    <CgClose size={28} color='var(--text3)' />
                </div>
            </section>
        </div>
    );
}
