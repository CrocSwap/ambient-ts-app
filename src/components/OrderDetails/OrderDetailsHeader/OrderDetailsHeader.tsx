import styles from './OrderDetailsHeader.module.css';
import { Dispatch, SetStateAction, useState } from 'react';
import ambientLogo from '../../../assets/images/logos/ambient_logo.svg';
import { FiCopy, FiDownload } from 'react-icons/fi';
import { CgClose } from 'react-icons/cg';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
interface OrderDetailsPropsIF {
    onClose: () => void;
    downloadAsImage: () => void;
    showSettings: boolean;
    setShowSettings: Dispatch<SetStateAction<boolean>>;
    showShareComponent: boolean;
    setShowShareComponent: Dispatch<SetStateAction<boolean>>;
}
export default function OrderDetailsHeader(props: OrderDetailsPropsIF) {
    const { onClose, downloadAsImage, showShareComponent, setShowShareComponent } = props;
    // eslint-disable-next-line
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const phIcon = <FiCopy size={25} color='var(--text-grey-dark)' style={{ opacity: '0' }} />;
    // eslint-disable-next-line
    const [value, copy] = useCopyToClipboard();

    function handleCopyAddress() {
        copy('example details data');
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
                    {showShareComponent ? 'Info' : 'Share'}
                </button>

                {showShareComponent ? (
                    <div onClick={handleCopyAddress}>
                        <FiCopy size={25} color='var(--text-grey-dark)' />
                    </div>
                ) : (
                    phIcon
                )}

                {showShareComponent ? (
                    <div onClick={downloadAsImage}>
                        <FiDownload size={25} color='var(--text-grey-dark)' />
                    </div>
                ) : (
                    phIcon
                )}

                <div onClick={onClose}>
                    <CgClose size={28} color='var(--text-grey-dark)' />
                </div>
            </section>
        </div>
    );
}
