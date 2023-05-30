import styles from './RangeDetailsHeader.module.css';
import ambientLogo from '../../../assets/images/logos/ambient_logo.svg';
import { FiCopy } from 'react-icons/fi';
import { CgClose } from 'react-icons/cg';
import { Dispatch, SetStateAction } from 'react';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';

interface RangeDetailsPropsIF {
    onClose: () => void;
    downloadAsImage: () => void;
    showShareComponent: boolean;
    setShowShareComponent: Dispatch<SetStateAction<boolean>>;
    handleCopyPositionId(): void;
}
export default function RangeDetailsHeader(props: RangeDetailsPropsIF) {
    const {
        onClose,
        handleCopyPositionId,
        // downloadAsImage,
        showShareComponent,
        setShowShareComponent,
    } = props;

    const phIcon = (
        <FiCopy size={25} color='var(--text3)' style={{ opacity: '0' }} />
    );

    const copyIconWithTooltip = (
        <IconWithTooltip
            title='Copy position slot ID to clipboard'
            placement='bottom'
        >
            <div onClick={handleCopyPositionId}>
                <FiCopy size={25} color='var(--text3)' />
            </div>
        </IconWithTooltip>
    );

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
                <button
                    className={styles.info_button}
                    onClick={() => setShowShareComponent(!showShareComponent)}
                >
                    {showShareComponent ? 'Details' : 'Share'}
                </button>

                {/* {showShareComponent ? (
                    <div onClick={handleCopyAddress}>
                        <FiCopy size={25} color='var(--text3)' />
                    </div>
                ) : (
                    phIcon
                )} */}
                {showShareComponent ? copyIconWithTooltip : phIcon}

                {/* {showShareComponent ? downloadIconWithTooltip : phIcon} */}

                <div onClick={onClose}>
                    <CgClose size={28} color='var(--text3)' />
                </div>
            </section>
        </div>
    );
}
