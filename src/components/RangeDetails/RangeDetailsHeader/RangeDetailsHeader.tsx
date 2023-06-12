import styles from './RangeDetailsHeader.module.css';
import ambientLogo from '../../../assets/images/logos/ambient_logo.svg';
import ambientLogoText from '../../../assets/images/logos/logo_text.png';

import { FiCopy } from 'react-icons/fi';
import { CgClose } from 'react-icons/cg';
import { Dispatch, SetStateAction } from 'react';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';

interface RangeDetailsPropsIF {
    onClose: () => void;
    copyRangeDetailsToClipboard: () => Promise<void>;
    showShareComponent: boolean;
    setShowShareComponent: Dispatch<SetStateAction<boolean>>;
    handleCopyPositionId(): void;
}
export default function RangeDetailsHeader(props: RangeDetailsPropsIF) {
    const {
        onClose,
        handleCopyPositionId,
        copyRangeDetailsToClipboard,
        showShareComponent,
        setShowShareComponent,
    } = props;

    const copySlotIDIconWithTooltip = (
        <IconWithTooltip
            title='Copy position slot ID to clipboard'
            placement='bottom'
        >
            <div onClick={handleCopyPositionId}>
                <FiCopy size={25} color='var(--text3)' />
            </div>
        </IconWithTooltip>
    );

    const copyImageIconWithTooltip = (
        <IconWithTooltip title='Copy shareable image' placement='bottom'>
            <div onClick={copyRangeDetailsToClipboard}>
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
                <button
                    className={styles.info_button}
                    onClick={() => setShowShareComponent(!showShareComponent)}
                >
                    {showShareComponent ? 'Details' : 'Share'}
                </button>
                {!showShareComponent ? copySlotIDIconWithTooltip : null}
                {showShareComponent ? copyImageIconWithTooltip : null}

                <div onClick={onClose}>
                    <CgClose size={28} color='var(--text3)' />
                </div>
            </section>
        </div>
    );
}
