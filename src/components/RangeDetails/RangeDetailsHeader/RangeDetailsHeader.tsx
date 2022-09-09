import styles from './RangeDetailsHeader.module.css';
import ambientLogo from '../../../assets/images/logos/ambient_logo.svg';
import { FiSettings, FiCopy, FiDownload } from 'react-icons/fi';
import { CgClose } from 'react-icons/cg';
import { Dispatch, SetStateAction } from 'react';

interface RangeDetailsPropsIF {
    onClose: () => void;
    showSettings: boolean;
    setShowSettings: Dispatch<SetStateAction<boolean>>;
}
export default function RangeDetailsHeader(props: RangeDetailsPropsIF) {
    const { onClose, showSettings, setShowSettings } = props;
    return (
        <div className={styles.container}>
            <section>
                <img src={ambientLogo} alt='ambient' width='35px' />
                <span className={styles.ambient_title}>ambient</span>
            </section>

            <section className={styles.ambient_text}>ambient.finance</section>

            <section className={styles.settings_control}>
                <div onClick={() => setShowSettings(!showSettings)}>
                    <FiSettings />
                </div>
                <FiCopy />
                <FiDownload />
                <div onClick={onClose}>
                    <CgClose size={25} />
                </div>
            </section>
        </div>
    );
}
