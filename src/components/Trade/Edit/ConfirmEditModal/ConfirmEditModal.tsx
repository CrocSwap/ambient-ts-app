import styles from './ConfirmEditModal.module.css';
import Button from '../../../Global/Button/Button';
import CurrencyDisplayContainer from '../CurrencyDisplayContainer/CurrencyDisplayContainer';
import Divider from '../../../Global/Divider/Divider';
import EditPriceInfo from '../EditPriceInfo/EditPriceInfo';

interface ConfirmEditModalProps {
    onClose: () => void;
}

export default function ConfirmEditModal(props: ConfirmEditModalProps) {
    const closeButton = <Button title='Close' action={props.onClose} />;

    const fullTxDetails = (
        <div>
            {/* <CurrencyDisplayContainer /> */}
            <Divider />
            {/* <EditPriceInfo /> */}
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
