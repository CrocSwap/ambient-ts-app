import styles from './RangeDetailsHeader.module.css';
import ambientLogo from '../../../assets/images/logos/ambient_logo.svg';
import { FiCopy } from 'react-icons/fi';
import { CgClose } from 'react-icons/cg';
import { Dispatch, SetStateAction } from 'react';
// import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
// import SnackbarComponent from '../../../components/Global/SnackbarComponent/SnackbarComponent';
import { PositionIF } from '../../../utils/interfaces/PositionIF';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';

interface RangeDetailsPropsIF {
    onClose: () => void;
    downloadAsImage: () => void;
    showSettings: boolean;
    setShowSettings: Dispatch<SetStateAction<boolean>>;
    showShareComponent: boolean;
    setShowShareComponent: Dispatch<SetStateAction<boolean>>;
    position: PositionIF;
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
    // const [openSnackbar, setOpenSnackbar] = useState(false);
    const phIcon = (
        <FiCopy size={25} color='var(--text3)' style={{ opacity: '0' }} />
    );

    // const [value, copy] = useCopyToClipboard();

    //    function handleCopyAddress() {
    //        const txHash = position.tx;
    //        copy(txHash);
    //        setOpenSnackbar(true);
    //    }

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

    // eslint-disable-next-line
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
