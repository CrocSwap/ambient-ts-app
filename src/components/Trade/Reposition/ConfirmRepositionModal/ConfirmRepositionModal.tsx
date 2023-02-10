import Divider from '../../../Global/Divider/Divider';
import RepositionPriceInfo from '../RepositionPriceInfo/RepositionPriceInfo';
import styles from './ConfirmRepositionModal.module.css';
import Button from '../../../Global/Button/Button';
import { PositionIF } from '../../../../utils/interfaces/PositionIF';
import { Dispatch, SetStateAction } from 'react';

interface ConfirmRepositionModalProps {
    onClose: () => void;
    position: PositionIF;
    ambientApy: number | undefined;
    rangeWidthPercentage: number;
    currentPoolPriceTick: number;
    currentPoolPriceDisplay: string;
    onSend: () => void;
    setMaxPrice: Dispatch<SetStateAction<number>>;
    setMinPrice: Dispatch<SetStateAction<number>>;
}

export default function ConfirmRepositionModal(props: ConfirmRepositionModalProps) {
    const {
        position,
        ambientApy,
        currentPoolPriceDisplay,
        currentPoolPriceTick,
        rangeWidthPercentage,
        onSend,
        setMinPrice,
        setMaxPrice,
    } = props;

    const sendButton = <Button title='Send Reposition' action={onSend} flat={true} />;

    const fullTxDetails = (
        <div>
            <h1>confirm reposition token content here</h1>
            <Divider />
            <RepositionPriceInfo
                position={position}
                rangeWidthPercentage={rangeWidthPercentage}
                currentPoolPriceTick={currentPoolPriceTick}
                currentPoolPriceDisplay={currentPoolPriceDisplay}
                ambientApy={ambientApy}
                setMaxPrice={setMaxPrice}
                setMinPrice={setMinPrice}
            />
        </div>
    );

    const modal = (
        <div className={styles.modal_container}>
            <section className={styles.modal_content}>{fullTxDetails}</section>
            <footer className={styles.modal_footer}>{sendButton}</footer>
        </div>
    );
    return <>{modal}</>;
}
