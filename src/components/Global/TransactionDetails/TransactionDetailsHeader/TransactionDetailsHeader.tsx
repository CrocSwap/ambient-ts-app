import styles from './TransactionDetailsHeader.module.css';
import { Dispatch, SetStateAction, useState } from 'react';
import ambientLogo from '../../../../assets/images/logos/ambient_logo.svg';
import { FiSettings, FiCopy, FiDownload } from 'react-icons/fi';
import { CgClose } from 'react-icons/cg';
import useCopyToClipboard from '../../../../utils/hooks/useCopyToClipboard';
import SnackbarComponent from '../../../../components/Global/SnackbarComponent/SnackbarComponent';
interface TransactionDetailsHeaderPropsIF {
    onClose: () => void;
    downloadAsImage: () => void;
    showSettings: boolean;
    setShowSettings: Dispatch<SetStateAction<boolean>>;
}
export default function TransactionDetailsHeader(props: TransactionDetailsHeaderPropsIF) {
    const { onClose, showSettings, setShowSettings, downloadAsImage } = props;
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const [value, copy] = useCopyToClipboard();

    function handleCopyAddress() {
        copy('example details data');
        setOpenSnackbar(true);
    }

    const snackbarContent = (
        <SnackbarComponent
            severity='info'
            setOpenSnackbar={setOpenSnackbar}
            openSnackbar={openSnackbar}
        >
            {value} copied
        </SnackbarComponent>
    );

    return (
        <div className={styles.container} style={{ padding: !showSettings ? '1rem 0' : '0' }}>
            <section>
                <img src={ambientLogo} alt='ambient' width='35px' />
                <span className={styles.ambient_title}>ambient</span>
            </section>

            <section className={styles.ambient_text}>ambient.finance</section>

            <section className={styles.settings_control}>
                <div onClick={() => setShowSettings(!showSettings)}>
                    <FiSettings />
                </div>
                <div onClick={handleCopyAddress}>
                    <FiCopy />
                </div>
                <div onClick={downloadAsImage}>
                    <FiDownload />
                </div>
                <div onClick={onClose}>
                    <CgClose size={25} />
                </div>
            </section>
            {snackbarContent}
        </div>
    );
}
