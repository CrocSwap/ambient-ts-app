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
import {
    getPinnedPriceValuesFromTicks,
    getPinnedPriceValuesFromDisplayPrices,
} from '../Range/rangeFunctions';
import truncateDecimals from '../../../utils/data/truncateDecimals';
import { PositionIF } from '../../../utils/interfaces/PositionIF';
import { tickToPrice, toDisplayPrice } from '@crocswap-libs/sdk';
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

    // const minPricePercentage = -15;
    // const maxPricePercentage = 15;

    const [rangeLowTick, setRangeLowTick] = useState(position.bidTick);
    const [rangeHighTick, setRangeHighTick] = useState(position.askTick);

    const [initializationComplete, setInitializationComplete] = useState(false);

    const isAdvancedModeActive = true;
    const [denominationsInBase, setDenominationsInBase] = useState(true);

    useEffect(() => {
        if (isAdvancedModeActive) {
            const rangeLowBoundDisplayField = document.getElementById(
                'edit-base-price-input-quantity',
            ) as HTMLInputElement;
            if (rangeLowBoundDisplayField) {
                // console.log(rangeLowBoundDisplayField.value);
                setInitializationComplete(false);
            }
            const rangeHighBoundDisplayField = document.getElementById(
                'edit-quote-price-input-quantity',
            ) as HTMLInputElement;
            if (rangeHighBoundDisplayField) {
                setInitializationComplete(false);
            }
        }
    }, [denominationsInBase, isAdvancedModeActive, rangeLowTick, rangeHighTick, location.pathname]);

    const baseTokenDecimals = position.baseTokenDecimals;
    const quoteTokenDecimals = position.quoteTokenDecimals;

    // const [rangeLowBoundNonDisplayPrice, setRangeLowBoundNonDisplayPrice] = useState(0);
    // const [rangeHighBoundNonDisplayPrice, setRangeHighBoundNonDisplayPrice] = useState(0);

    const [pinnedMinPriceDisplayTruncated, setPinnedMinPriceDisplayTruncated] = useState(
        position.lowRangeDisplay,
    );
    const [pinnedMaxPriceDisplayTruncated, setPinnedMaxPriceDisplayTruncated] = useState(
        position.highRangeDisplay,
    );

    const currentPoolPriceTick = position.poolPriceInTicks ?? 0;
    const currentPoolPriceNonDisplay = tickToPrice(currentPoolPriceTick);

    const currentPoolDisplayPriceInQuote = toDisplayPrice(
        currentPoolPriceNonDisplay,
        baseTokenDecimals,
        quoteTokenDecimals,
    );

    const currentPoolDisplayPriceInBase =
        1 / toDisplayPrice(currentPoolPriceNonDisplay, baseTokenDecimals, quoteTokenDecimals);

    const truncatedCurrentPoolDisplayPriceInQuote =
        currentPoolDisplayPriceInQuote < 2
            ? truncateDecimals(currentPoolDisplayPriceInQuote, 4)
            : truncateDecimals(currentPoolDisplayPriceInQuote, 2);
    const truncatedCurrentPoolDisplayPriceInBase =
        currentPoolDisplayPriceInBase < 2
            ? truncateDecimals(currentPoolDisplayPriceInBase, 4)
            : truncateDecimals(currentPoolDisplayPriceInBase, 2);

    const currentPoolPriceDisplay =
        currentPoolPriceNonDisplay === 0
            ? '0'
            : denominationsInBase
            ? truncatedCurrentPoolDisplayPriceInBase
            : truncatedCurrentPoolDisplayPriceInQuote;

    const defaultMinPriceDifferencePercentage = -15;
    const defaultMaxPriceDifferencePercentage = 15;

    const [minPriceDifferencePercentage, setMinPriceDifferencePercentage] = useState(
        defaultMinPriceDifferencePercentage,
    );
    const [maxPriceDifferencePercentage, setMaxPriceDifferencePercentage] = useState(
        defaultMaxPriceDifferencePercentage,
    );

    useEffect(() => {
        setRangeLowTick(position.bidTick);
    }, [position.bidTick]);

    useEffect(() => {
        setRangeHighTick(position.askTick);
    }, [position.askTick]);

    useEffect(() => {
        if (!initializationComplete && isAdvancedModeActive) {
            const pinnedDisplayPrices = getPinnedPriceValuesFromTicks(
                denominationsInBase,
                baseTokenDecimals,
                quoteTokenDecimals,
                rangeLowTick,
                rangeHighTick,
            );
            // console.log({ pinnedDisplayPrices });
            // setRangeLowBoundNonDisplayPrice(pinnedDisplayPrices.pinnedMinPriceNonDisplay);
            // setRangeHighBoundNonDisplayPrice(pinnedDisplayPrices.pinnedMaxPriceNonDisplay);

            // setPinnedMinPriceDisplay(pinnedDisplayPrices.pinnedMinPriceDisplay);
            // setPinnedMaxPriceDisplay(pinnedDisplayPrices.pinnedMaxPriceDisplay);

            setPinnedMinPriceDisplayTruncated(pinnedDisplayPrices.pinnedMinPriceDisplayTruncated);
            setPinnedMaxPriceDisplayTruncated(pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated);

            setRangeLowTick(pinnedDisplayPrices.pinnedLowTick);
            setRangeHighTick(pinnedDisplayPrices.pinnedHighTick);

            const highTickDiff = pinnedDisplayPrices.pinnedHighTick - currentPoolPriceTick;
            const lowTickDiff = pinnedDisplayPrices.pinnedLowTick - currentPoolPriceTick;

            const highGeometricDifferencePercentage =
                Math.abs(highTickDiff) < 200
                    ? parseFloat(truncateDecimals(highTickDiff / 100, 2))
                    : parseFloat(truncateDecimals(highTickDiff / 100, 0));
            const lowGeometricDifferencePercentage =
                Math.abs(lowTickDiff) < 200
                    ? parseFloat(truncateDecimals(lowTickDiff / 100, 2))
                    : parseFloat(truncateDecimals(lowTickDiff / 100, 0));
            denominationsInBase
                ? setMaxPriceDifferencePercentage(-lowGeometricDifferencePercentage)
                : setMaxPriceDifferencePercentage(highGeometricDifferencePercentage);

            denominationsInBase
                ? setMinPriceDifferencePercentage(-highGeometricDifferencePercentage)
                : setMinPriceDifferencePercentage(lowGeometricDifferencePercentage);

            // console.log({ pinnedDisplayPrices });

            const rangeLowBoundDisplayField = document.getElementById(
                'edit-base-price-input-quantity',
            ) as HTMLInputElement;

            if (rangeLowBoundDisplayField) {
                rangeLowBoundDisplayField.value =
                    pinnedDisplayPrices.pinnedMinPriceDisplayTruncated;
                const rangeHighBoundDisplayField = document.getElementById(
                    'edit-quote-price-input-quantity',
                ) as HTMLInputElement;

                if (rangeHighBoundDisplayField) {
                    rangeHighBoundDisplayField.value =
                        pinnedDisplayPrices.pinnedMaxPriceDisplayTruncated;
                    setInitializationComplete(true);
                } else {
                    // console.log('high bound field not found');
                }
            } else {
                // console.log('low bound field not found');
            }
        }
    }, [
        currentPoolPriceTick,
        initializationComplete,
        isAdvancedModeActive,
        denominationsInBase,
        baseTokenDecimals,
        quoteTokenDecimals,
    ]);

    const [minPriceInputString, setMinPriceInputString] = useState<string>('');
    const [maxPriceInputString, setMaxPriceInputString] = useState<string>('');

    const [rangeLowBoundFieldBlurred, setRangeLowBoundFieldBlurred] = useState(true);

    const lowBoundOnBlur = () => setRangeLowBoundFieldBlurred(true);

    // const rangeLowBoundDisplayPrice = 1;
    // const rangeHighBoundDisplayPrice = 1;

    const [rangeHighBoundFieldBlurred, setRangeHighBoundFieldBlurred] = useState(true);
    const highBoundOnBlur = () => setRangeHighBoundFieldBlurred(true);

    useEffect(() => {
        // console.log('low bound blurred');
        if (rangeLowBoundFieldBlurred) {
            const rangeLowBoundDisplayField = document.getElementById(
                'edit-base-price-input-quantity',
            ) as HTMLInputElement;
            if (rangeLowBoundDisplayField) {
                // rangeLowBoundDisplayField.value = pinnedMinPriceDisplayTruncated.toString();
                if (rangeLowBoundDisplayField.value !== pinnedMinPriceDisplayTruncated) {
                    const pinnedDisplayPrices = getPinnedPriceValuesFromDisplayPrices(
                        denominationsInBase,
                        baseTokenDecimals,
                        quoteTokenDecimals,
                        rangeLowBoundDisplayField.value,
                        pinnedMaxPriceDisplayTruncated,
                    );

                    !denominationsInBase
                        ? setRangeLowTick(pinnedDisplayPrices.pinnedLowTick)
                        : setRangeHighTick(pinnedDisplayPrices.pinnedHighTick);
                }
            }
            setRangeLowBoundFieldBlurred(false);
        }
    }, [rangeLowBoundFieldBlurred]);

    useEffect(() => {
        // console.log('high bound blurred');
        if (rangeHighBoundFieldBlurred) {
            const rangeHighBoundDisplayField = document.getElementById(
                'edit-quote-price-input-quantity',
            ) as HTMLInputElement;
            if (rangeHighBoundDisplayField) {
                if (rangeHighBoundDisplayField.value !== pinnedMaxPriceDisplayTruncated) {
                    const pinnedDisplayPrices = getPinnedPriceValuesFromDisplayPrices(
                        denominationsInBase,
                        baseTokenDecimals,
                        quoteTokenDecimals,
                        pinnedMinPriceDisplayTruncated,
                        rangeHighBoundDisplayField.value,
                    );

                    denominationsInBase
                        ? setRangeLowTick(pinnedDisplayPrices.pinnedLowTick)
                        : setRangeHighTick(pinnedDisplayPrices.pinnedHighTick);
                }
            }
            setRangeHighBoundFieldBlurred(false);
        }
    }, [rangeHighBoundFieldBlurred]);

    const { positionHash } = useParams();

    const confirmEditModal = isModalOpen ? (
        <Modal onClose={closeModal} title='Edit Position'>
            <ConfirmEditModal
                onClose={closeModal}
                position={position}
                currentPoolPriceDisplay={currentPoolPriceDisplay}
            />
        </Modal>
    ) : null;

    // Props for <EditMinMaxPrice/> React element
    const editMinMaxPriceProps = {
        minPricePercentage: minPriceDifferencePercentage,
        maxPricePercentage: maxPriceDifferencePercentage,
        minPriceInputString: minPriceInputString,
        maxPriceInputString: maxPriceInputString,
        setMinPriceInputString: setMinPriceInputString,
        setMaxPriceInputString: setMaxPriceInputString,
        isDenomBase: denominationsInBase,
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
        currentPoolPriceDisplay: currentPoolPriceDisplay,
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
                <EditDenominationSwitch
                    denominationsInBase={denominationsInBase}
                    setDenominationsInBase={setDenominationsInBase}
                />
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
