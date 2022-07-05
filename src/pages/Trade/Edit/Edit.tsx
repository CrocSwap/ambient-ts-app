import EditHeader from '../../../components/Trade/Edit/EditHeader/EditHeader';
import styles from './Edit.module.css';
import { useParams, useLocation, Navigate } from 'react-router-dom';
import CurrencyDisplayContainer from '../../../components/Trade/Edit/CurrencyDisplayContainer/CurrencyDisplayContainer';
import EditMinMaxPrice from '../../../components/Trade/Edit/EditMinMaxPrice/EditMinMaxPrice';
import EditPriceInfo from '../../../components/Trade/Edit/EditPriceInfo/EditPriceInfo';
import EditButton from '../../../components/Trade/Edit/EditButton/EditButton';
import Divider from '../../../components/Global/Divider/Divider';
import Modal from '../../../components/Global/Modal/Modal';
import ConfirmEditModal from '../../../components/Trade/Edit/ConfirmEditModal/ConfirmEditModal';
import { useModal } from '../../../components/Global/Modal/useModal';
import { useState, useEffect } from 'react';
import EditDenominationSwitch from '../../../components/Trade/Edit/EditDenominationSwitch/EditDenominationSwitch';

import { PositionIF } from '../../../utils/interfaces/PositionIF';
interface PositionState {
    position: PositionIF;
}

export default function Edit() {
    const [isModalOpen, openModal, closeModal] = useModal();

    const location = useLocation();

    // Redirect if we don't have a position in state(just url)
    const state = location.state as PositionState;
    if (!state) {
        console.warn(
            'Dev Readonly: No position data to be displayed. Url does not contain state without active click from the position',
        );
        console.log(
            'Dev Readonly: No position data to be displayed. Url does not contain state without active click from the position',
        );
        return <Navigate replace to='/trade/range' />;
    }

    const { position } = state;

    const minPricePercentage = -15;
    const maxPricePercentage = 15;

    const [rangeLowTick, setRangeLowTick] = useState(0);
    const [rangeHighTick, setRangeHighTick] = useState(0);

    const isDenomBase = false;

    const [minPriceInputString, setMinPriceInputString] = useState<string>('');
    const [maxPriceInputString, setMaxPriceInputString] = useState<string>('');

    const [rangeLowBoundFieldBlurred, setRangeLowBoundFieldBlurred] = useState(true);

    const lowBoundOnBlur = () => setRangeLowBoundFieldBlurred(true);

    const rangeLowBoundDisplayPrice = 1;
    const rangeHighBoundDisplayPrice = 1;

    const [rangeHighBoundFieldBlurred, setRangeHighBoundFieldBlurred] = useState(true);
    const highBoundOnBlur = () => setRangeHighBoundFieldBlurred(true);

    useEffect(() => {
        // console.log('low bound blurred');
        if (rangeLowBoundFieldBlurred) {
            const rangeLowBoundDisplayField = document.getElementById(
                'min-price-input-quantity',
            ) as HTMLInputElement;
            if (rangeLowBoundDisplayField) {
                rangeLowBoundDisplayField.value = rangeLowBoundDisplayPrice.toString();
            }
            setRangeLowBoundFieldBlurred(false);
        }
    }, [rangeLowBoundDisplayPrice, rangeLowBoundFieldBlurred]);

    useEffect(() => {
        // console.log('high bound blurred');
        if (rangeHighBoundFieldBlurred) {
            const rangeHighBoundDisplayField = document.getElementById(
                'max-price-input-quantity',
            ) as HTMLInputElement;
            if (rangeHighBoundDisplayField) {
                rangeHighBoundDisplayField.value = rangeHighBoundDisplayPrice.toString();
            }
            setRangeHighBoundFieldBlurred(false);
        }
    }, [rangeHighBoundDisplayPrice, rangeHighBoundFieldBlurred]);

    const { positionHash } = useParams();

    const confirmEditModal = isModalOpen ? (
        <Modal onClose={closeModal} title='Edit Position'>
            <ConfirmEditModal onClose={closeModal} position={position} />
        </Modal>
    ) : null;

    // Props for <EditMinMaxPrice/> React element
    const editMinMaxPriceProps = {
        minPricePercentage: minPricePercentage,
        maxPricePercentage: maxPricePercentage,
        minPriceInputString: minPriceInputString,
        maxPriceInputString: maxPriceInputString,
        setMinPriceInputString: setMinPriceInputString,
        setMaxPriceInputString: setMaxPriceInputString,
        isDenomBase: isDenomBase,
        highBoundOnBlur: highBoundOnBlur,
        lowBoundOnBlur: lowBoundOnBlur,
        rangeLowTick: rangeLowTick,
        rangeHighTick: rangeHighTick,
        setRangeLowTick: setRangeLowTick,
        setRangeHighTick: setRangeHighTick,
        minPrice: position?.lowRangeDisplay,
        maxPrice: position?.highRangeDisplay,
    };
    // Props for <CurrencyDisplayContainer/> React element

    const currencyDisplayContainerProps = {
        quoteTokenSymbol: position.quoteTokenSymbol,
        baseTokenSymbol: position.baseTokenSymbol,
        tokenAQtyDisplay: position.tokenAQtyDisplay,
        tokenBQtyDisplay: position.tokenBQtyDisplay,
    };

    const editPriceInfoProps = {
        quoteTokenSymbol: position.quoteTokenSymbol,
        baseTokenSymbol: position.baseTokenSymbol,
        tokenAQtyDisplay: position.tokenAQtyDisplay,
        tokenBQtyDisplay: position.tokenBQtyDisplay,
        ambient: position.ambient,
        lowRangeDisplay: position.lowRangeDisplay,
        highRangeDisplay: position.highRangeDisplay,
    };

    return (
        <div className={styles.editContainer}>
            <EditHeader positionHash={positionHash} />
            <div className={styles.edit_content}>
                <EditDenominationSwitch />
                <CurrencyDisplayContainer {...currencyDisplayContainerProps} />
                <Divider />
                {position.ambient == false && <EditMinMaxPrice {...editMinMaxPriceProps} />}
                <EditPriceInfo {...editPriceInfoProps} />
                <EditButton onClickFn={openModal} />
            </div>
            {confirmEditModal}
        </div>
    );
}
