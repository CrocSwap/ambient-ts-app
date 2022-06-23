import styles from './ConfirmEditModal.module.css';
import Button from '../../../Global/Button/Button';
import CurrencyDisplayContainer from '../CurrencyDisplayContainer/CurrencyDisplayContainer';
import Divider from '../../../Global/Divider/Divider';
import EditPriceInfo from '../EditPriceInfo/EditPriceInfo';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';
interface ConfirmEditModalProps {
    onClose: () => void;
    position: PositionIF;
}

export default function ConfirmEditModal(props: ConfirmEditModalProps) {
    const closeButton = <Button title='Close' action={props.onClose} />;
    const { position } = props;

    const fullTxDetails = (
        <div>
            <CurrencyDisplayContainer
                quoteTokenSymbol={position.quoteTokenSymbol}
                baseTokenSymbol={position.baseTokenSymbol}
                tokenAQtyDisplay={position.tokenAQtyDisplay}
                tokenBQtyDisplay={position.tokenBQtyDisplay}
                disable
            />
            <Divider />
            <EditPriceInfo
                quoteTokenSymbol={position.quoteTokenSymbol}
                baseTokenSymbol={position.baseTokenSymbol}
                tokenAQtyDisplay={position.tokenAQtyDisplay}
                tokenBQtyDisplay={position.tokenBQtyDisplay}
                ambient={position.ambient}
                lowRangeDisplay={position.lowRangeDisplay}
                highRangeDisplay={position.highRangeDisplay}
            />
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
