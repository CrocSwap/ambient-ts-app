import styles from './ConfirmEditModal.module.css';
import Button from '../../../Global/Button/Button';
import CurrencyDisplayContainer from '../CurrencyDisplayContainer/CurrencyDisplayContainer';
import Divider from '../../../Global/Divider/Divider';
import EditPriceInfo from '../EditPriceInfo/EditPriceInfo';
import { Position } from '../../../../utils/state/graphDataSlice';

interface ConfirmEditModalPropsIF {
    onClose: () => void;
    position: Position;
    // position: PositionIF;
    currentPoolPriceDisplay: string;
    denominationsInBase: boolean;
    baseTokenImageURL: string;
    quoteTokenImageURL: string;
    pinnedMinPriceDisplayTruncated: string;
    pinnedMaxPriceDisplayTruncated: string;
    lowPriceDisplayTruncated: string;
    highPriceDisplayTruncated: string;
}

export default function ConfirmEditModal(props: ConfirmEditModalPropsIF) {
    const {
        onClose,
        position,
        denominationsInBase,
        baseTokenImageURL,
        quoteTokenImageURL,
        pinnedMinPriceDisplayTruncated,
        pinnedMaxPriceDisplayTruncated,
        lowPriceDisplayTruncated,
        highPriceDisplayTruncated,
    } = props;

    const closeButton = <Button title='Close' action={onClose} />;

    const fullTxDetails = (
        <div>
            <CurrencyDisplayContainer
                quoteTokenSymbol={position.quoteTokenSymbol}
                baseTokenSymbol={position.baseTokenSymbol}
                tokenAQtyDisplay={position.tokenAQtyDisplay}
                tokenBQtyDisplay={position.tokenBQtyDisplay}
                baseTokenImageURL={baseTokenImageURL}
                quoteTokenImageURL={quoteTokenImageURL}
                disable
            />
            <Divider />
            <EditPriceInfo
                currentPoolPriceDisplay={props.currentPoolPriceDisplay}
                denominationsInBase={denominationsInBase}
                quoteTokenSymbol={position.quoteTokenSymbol}
                baseTokenSymbol={position.baseTokenSymbol}
                tokenAQtyDisplay={position.tokenAQtyDisplay}
                tokenBQtyDisplay={position.tokenBQtyDisplay}
                ambient={position.ambient}
                // lowRangeDisplay={position.lowRangeDisplayInBase}
                // highRangeDisplay={position.highRangeDisplayInBase}
                pinnedMinPriceDisplayTruncated={pinnedMinPriceDisplayTruncated}
                pinnedMaxPriceDisplayTruncated={pinnedMaxPriceDisplayTruncated}
                lowPriceDisplayTruncated={lowPriceDisplayTruncated}
                highPriceDisplayTruncated={highPriceDisplayTruncated}
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
