import styles from './OrderDetailsHeader.module.css';
import { Dispatch, SetStateAction } from 'react';
import logo from '../../../assets/images/logos/logo_mark.svg';
import logoText from '../../../assets/images/logos/logo_text.png';

import { FiCopy } from 'react-icons/fi';
import { CgClose } from 'react-icons/cg';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';

interface OrderDetailsPropsIF {
    copyOrderDetailsToClipboard: () => Promise<void>;
    showShareComponent: boolean;
    setShowShareComponent: Dispatch<SetStateAction<boolean>>;
    handleCopyPositionId(): void;
    onClose: () => void;
}
export default function OrderDetailsHeader(props: OrderDetailsPropsIF) {
    const {
        handleCopyPositionId,
        showShareComponent,
        setShowShareComponent,
        copyOrderDetailsToClipboard,
        onClose,
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
            <div onClick={copyOrderDetailsToClipboard}>
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

            <section className={styles.settings_control}>
                {!showShareComponent ? copySlotIDIconWithTooltip : null}
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
