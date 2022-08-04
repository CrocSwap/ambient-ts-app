import Divider from '../../../Global/Divider/Divider';
import RepositionPriceInfo from '../RepositionPriceInfo/RepositionPriceInfo';
import styles from './ConfirmRepositionModal.module.css';
import Button from '../../../Global/Button/Button';

interface ConfirmRepositionModalProps {
    onClose: () => void;
}

export default function ConfirmRepositionModal(props: ConfirmRepositionModalProps) {
    const closeButton = <Button title='Close' action={props.onClose} />;

    const fullTxDetails = (
        <div>
            <h1>confirm reposition token content here</h1>
            <Divider />
            <RepositionPriceInfo />
        </div>
    );

    const modal = (
        <div className={styles.modal_container}>
            <section className={styles.modal_content}>{fullTxDetails}</section>
            <footer className={styles.modal_footer}>{closeButton}</footer>
        </div>
    );
    return <>{modal}</>;
}
